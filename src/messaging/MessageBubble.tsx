import * as React from 'react';
import { Button } from 'shared/general/button/Button';
import { MessageModel } from 'model';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { User } from 'util/model';
import { format } from 'date-fns';
import { Delete } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { useCurrentUser } from 'util/user/useCurrentUser';
import DeleteMessageMutation from 'api/mutation/DeleteMessageMutation.graphql';
import GetMessagesQuery from 'api/query/GetMessagesQuery.graphql';
import de from 'date-fns/locale/de';
import clsx from 'clsx';

import styles from './MessageBubble.module.scss';

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
                    const cache = client.readQuery<{
                        messages: MessageModel[];
                    }>({
                        query: GetMessagesQuery,
                    });
                    client.writeQuery({
                        query: GetMessagesQuery,
                        data: {
                            messages: cache?.messages?.filter(
                                (m) => m.id !== data.message.id
                            ),
                        },
                    });
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
                            user={message.senderUser}
                            className={styles.senderUserAvatar}
                            size={20}
                        />
                        {User.getName(message.senderUser)}
                    </span>
                    {format(new Date(message.insertedAt), 'PPPpp', {
                        locale: de,
                    })}
                    {message.senderUser?.id === currentUser?.id && (
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
