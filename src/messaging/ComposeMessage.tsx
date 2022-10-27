import * as React from 'react';

import { Button, ErrorMessage, Input } from '@lotta-schule/hubert';
import {
    NewMessageDestination,
    MessageModel,
    ConversationModel,
    ID,
} from 'model';
import { useMutation } from '@apollo/client';
import pick from 'lodash/pick';

import SendMessageMutation from 'api/mutation/SendMessageMutation.graphql';
import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';
import GetConversationQuery from 'api/query/GetConversationQuery.graphql';

import styles from './ComposeMessage.module.scss';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { Icon } from 'shared/Icon';

export interface ComposeMessageProps {
    destination: NewMessageDestination;
    onSent?: (message: MessageModel) => void;
}

export const ComposeMessage = React.memo<ComposeMessageProps>(
    ({ destination, onSent }) => {
        const inputRef = React.useRef<HTMLInputElement>(null);
        const [content, setContent] = React.useState('');

        React.useEffect(() => {
            setContent('');
            inputRef.current?.focus();
        }, [destination]);

        React.useEffect(() => {
            if (content === '') {
                inputRef.current?.focus();
            }
        }, [content]);

        const [createMessage, { loading: isLoading, error }] = useMutation<{
            message: Partial<MessageModel>;
        }>(SendMessageMutation, {
            errorPolicy: 'all',
            variables: {
                message: {
                    content,
                    recipientUser:
                        destination.user && pick(destination.user, 'id'),
                    recipientGroup:
                        destination.group && pick(destination.group, 'id'),
                },
            },
            update: (cache, { data }) => {
                if (data && data.message) {
                    const readConversationResult = cache.readQuery<
                        { conversation: ConversationModel },
                        { id: ID }
                    >({
                        query: GetConversationQuery,
                        variables: { id: data.message.conversation!.id },
                    });
                    const conversation = {
                        ...data.message.conversation,
                        ...readConversationResult?.conversation,
                        messages: [
                            data.message,
                            ...(readConversationResult?.conversation.messages ??
                                []),
                        ],
                    };
                    cache.writeQuery({
                        query: GetConversationQuery,
                        variables: { id: conversation.id },
                        data: { conversation },
                    });
                    const readConversationsResult = cache.readQuery<{
                        conversations: ConversationModel[];
                    }>({ query: GetConversationsQuery });
                    cache.writeQuery({
                        query: GetConversationsQuery,
                        data: {
                            conversations: [
                                {
                                    ...conversation,
                                    messages: conversation.messages.map((c) =>
                                        pick(c, ['id', '__typename'])
                                    ),
                                },
                                ...(readConversationsResult?.conversations?.filter(
                                    (c) => c.id !== conversation.id
                                ) ?? []),
                            ].filter(Boolean),
                        },
                        broadcast: true,
                    });
                }
            },
            onCompleted: ({ message }) => {
                setContent('');
                inputRef.current?.focus();
                onSent?.(message as MessageModel);
            },
        });

        const onSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            createMessage();
        };
        const onKeypress = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                createMessage();
            }
        };
        return (
            <div className={styles.root}>
                <form className={styles.form} onSubmit={onSubmit}>
                    <div>
                        <Input
                            multiline
                            ref={inputRef}
                            className={styles.textField}
                            maxHeight={'30vh'}
                            label={'Nachricht schreiben'}
                            disabled={isLoading}
                            value={content}
                            onChange={(e) => setContent(e.currentTarget.value)}
                            {
                                /* The input has no placeholder because giving
                                 * a placeholder would make it be squeezed down on mobile,
                                 * which would make the input tall, which would mess up
                                 * because of autogrowing input (try it out).
                                 * TODO: The solution here is to make the sidebar a
                                 * popover / modal instead of pushing the other things
                                 * aside (or adding kind of a overflowing wrapper
                                 * which would allow the main section
                                 * keeping its width. */ ...{}
                            }
                            placeholder={
                                /*`Schreibe eine neue Nachricht an ${Message.getDestinationName(
                                destination
                            )}`*/ undefined
                            }
                            onKeyPress={onKeypress}
                        />
                        {!!error && <ErrorMessage error={error} />}
                    </div>
                    <Button
                        className={styles.button}
                        type={'submit'}
                        disabled={isLoading}
                        icon={<Icon icon={faPaperPlane} size={'lg'} />}
                    />
                </form>
            </div>
        );
    },
    (prevProps, nextProps) => {
        const isSameUser =
            prevProps.destination.user?.id === nextProps.destination.user?.id;
        const isSameGroup =
            prevProps.destination.group?.id === nextProps.destination.group?.id;
        const isSameFn = prevProps.onSent === nextProps.onSent;

        return isSameUser && isSameGroup && isSameFn;
    }
);
ComposeMessage.displayName = 'MessageCompose';
