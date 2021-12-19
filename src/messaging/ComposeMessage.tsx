import * as React from 'react';
import { Toolbar } from '@material-ui/core';
import { Send } from '@material-ui/icons';
import { Button } from 'shared/general/button/Button';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { Input } from 'shared/general/form/input/Input';
import {
    NewMessageDestination,
    MessageModel,
    ConversationModel,
    ID,
} from 'model';
import { Message } from 'util/model/Message';
import { useMutation } from '@apollo/client';
import pick from 'lodash/pick';

import SendMessageMutation from 'api/mutation/SendMessageMutation.graphql';
import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';
import GetConversationQuery from 'api/query/GetConversationQuery.graphql';

import styles from './ComposeMessage.module.scss';

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
            <Toolbar className={styles.root}>
                <form className={styles.form} onSubmit={onSubmit}>
                    <div>
                        <Input
                            multiline
                            ref={inputRef}
                            className={styles.textField}
                            label={'Nachricht schreiben'}
                            disabled={isLoading}
                            value={content}
                            onChange={(e) => setContent(e.currentTarget.value)}
                            placeholder={`Schreibe eine neue Nachricht an ${Message.getDestinationName(
                                destination
                            )}`}
                            onKeyPress={onKeypress}
                        />
                        {!!error && <ErrorMessage error={error} />}
                    </div>
                    <Button
                        className={styles.button}
                        type={'submit'}
                        disabled={isLoading}
                        icon={<Send />}
                    />
                </form>
            </Toolbar>
        );
    }
);
ComposeMessage.displayName = 'MessageCompose';
