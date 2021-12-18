import * as React from 'react';
import { Button } from 'shared/general/button/Button';
import { ConversationModel, MessageModel } from 'model';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { User } from 'util/model';
import { format } from 'date-fns';
import { Delete } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { useCurrentUser } from 'util/user/useCurrentUser';
import DeleteMessageMutation from 'api/mutation/DeleteMessageMutation.graphql';
import de from 'date-fns/locale/de';
import clsx from 'clsx';

import styles from './MessageBubble.module.scss';

import GetConversationQuery from 'api/query/GetConversationQuery.graphql';
import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';

export interface MessageBubbleProps {
    active?: boolean;
    message: MessageModel;
}

export const MessageBubble = React.memo<MessageBubbleProps>(
    ({ active, message }) => {
        const currentUser = useCurrentUser();

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
                <div className={styles.message}>{message.content}</div>
                <div className={styles.messageInformation}>
                    <span className={styles.senderUser}>
                        <UserAvatar
                            user={message.user}
                            className={styles.senderUserAvatar}
                            size={20}
                        />
                        {User.getName(message.user)}
                    </span>
                    {format(new Date(message.insertedAt), 'PPPpp', {
                        locale: de,
                    })}
                    {message.user?.id === currentUser?.id && (
                        <Button
                            small
                            icon={<Delete />}
                            aria-label="Nachricht löschen"
                            onClick={() => deleteMessage()}
                        />
                    )}
                </div>
            </div>
        );
    }
);
