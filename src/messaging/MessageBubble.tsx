import * as React from 'react';
import { Button } from '@lotta-schule/hubert';
import { ConversationModel, MessageModel } from 'model';
import { User } from 'util/model';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { format } from 'date-fns';
import { Icon } from 'shared/Icon';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useMutation } from '@apollo/client';
import de from 'date-fns/locale/de';
import clsx from 'clsx';

import GetConversationQuery from 'api/query/GetConversationQuery.graphql';
import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';
import DeleteMessageMutation from 'api/mutation/DeleteMessageMutation.graphql';

import styles from './MessageBubble.module.scss';

export interface MessageBubbleProps {
    active?: boolean;
    message: MessageModel;
}

export const MessageBubble = React.memo<MessageBubbleProps>(
    ({ active, message }) => {
        const [deleteMessage] = useMutation(DeleteMessageMutation, {
            variables: { id: message.id },
            update: (client, { data }) => {
                if (data?.message) {
                    let msgConversation: ConversationModel | null = null;
                    const getConversationsCache = client.readQuery<{
                        conversations: ConversationModel[];
                    }>({
                        query: GetConversationsQuery,
                    });
                    client.writeQuery({
                        query: GetConversationsQuery,
                        data: {
                            conversations:
                                getConversationsCache?.conversations?.map(
                                    (conversation) => {
                                        if (
                                            conversation.messages.find(
                                                (m) => m.id === data.message.id
                                            )
                                        ) {
                                            msgConversation = conversation;
                                        }
                                        return {
                                            ...conversation,
                                            messages:
                                                conversation.messages.filter(
                                                    (m) =>
                                                        m.id !== data.message.id
                                                ),
                                        };
                                    }
                                ) ?? [],
                        },
                    });

                    if (msgConversation) {
                        const getConversationCache = client.readQuery<{
                            conversation: ConversationModel;
                        }>({
                            query: GetConversationQuery,
                            variables: {
                                id: (msgConversation as ConversationModel).id,
                            },
                        });
                        if (getConversationCache?.conversation) {
                            client.writeQuery({
                                query: GetConversationQuery,
                                data: {
                                    conversation: {
                                        ...getConversationCache.conversation,
                                        messages:
                                            getConversationCache.conversation.messages.filter(
                                                (m) => m.id !== data.message.id
                                            ),
                                    },
                                },
                            });
                        }
                    }
                }
            },
            optimisticResponse: ({ id }) => {
                return {
                    message: {
                        __typename: 'Message',
                        id,
                    },
                };
            },
        });

        return (
            <div className={clsx(styles.root, { [styles.isActive]: !!active })}>
                <div className={styles.user}>
                    <UserAvatar
                        user={message.user}
                        className={styles.senderUserAvatar}
                        size={40}
                    />
                </div>
                <div className={styles.messageWrapper}>
                    <div className={styles.message}>{message.content}</div>
                    <div className={styles.messageInformation}>
                        {active && (
                            <Button
                                small
                                icon={<Icon icon={faTrash} />}
                                title={'Nachricht löschen'}
                                onClick={() => deleteMessage()}
                            />
                        )}
                        <span>
                            {!active && <i>{User.getName(message.user)}, </i>}
                            {format(new Date(message.insertedAt), 'Pp', {
                                locale: de,
                            })}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);
MessageBubble.displayName = 'MessageBubble';
