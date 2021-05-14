import * as React from 'react';
import { fade, makeStyles, Theme, Typography } from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { MessageModel } from 'model';
import { UserAvatar } from 'component/user/UserAvatar';
import { User } from 'util/model';
import { format } from 'date-fns';
import { Delete } from '@material-ui/icons';
import { DeleteMessageMutation } from 'api/mutation/DeleteMessageMutation';
import { useMutation } from '@apollo/client';
import { GetMessagesQuery } from 'api/query/GetMessagesQuery';
import { useCurrentUser } from 'util/user/useCurrentUser';
import de from 'date-fns/locale/de';

export interface MessageBubbleProps {
    active?: boolean;
    message: MessageModel;
}

const useStyles = makeStyles<Theme, MessageBubbleProps>((theme) => {
    const withBaseColor = (fn: (baseColor: string) => any = (bg) => bg) => {
        return ({ active }: MessageBubbleProps) =>
            fn(theme.palette[active ? 'primary' : 'secondary'].main);
    };
    return {
        root: {
            padding: theme.spacing(1, 2),
            marginBottom: theme.spacing(4),
            cursor: 'default',
            position: 'relative',
            marginLeft: ({ active }) => (active ? '3em' : 'initial'),
            marginRight: ({ active }) => (active ? 'initial' : '3em'),

            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: withBaseColor(),
            borderRadius: theme.shape.borderRadius,
            backgroundColor: withBaseColor((bg) => fade(bg, 0.15)),

            overflow: 'hidden',

            '&:after': {
                content: ({ active }) => (active ? '""' : 'initial'),
                borderLeftWidth: 20,
                borderLeftStyle: 'solid',
                borderLeftColor: theme.palette.background.paper,
                borderTopWidth: 20,
                borderTopStyle: 'solid',
                borderTopColor: withBaseColor((bg) => fade(bg, 0.15)),
                backgroundColor: withBaseColor(),
                bottom: -20,
                position: 'absolute',
                left: ({ active }) => (active ? 'initial' : 20),
                right: ({ active }) => (active ? 20 : 'initial'),
            },
        },
        message: {
            paddingBotttom: theme.spacing(1),
        },
        senderUser: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
        senderUserAvatar: {
            height: '1em',
            width: '1em',
            display: 'inline-block',
            marginRight: '.25em',
        },
        messageInformation: {
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: theme.spacing(1),
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: fade(theme.palette.secondary.main, 0.3),
        },
    };
});

export const MessageBubble = React.memo<MessageBubbleProps>((props) => {
    const styles = useStyles(props);
    const currentUser = useCurrentUser();

    const { message } = props;

    const [deleteMessage] = useMutation(DeleteMessageMutation, {
        variables: { id: message.id },
        update: (client, { data }) => {
            if (data?.message) {
                const cache = client.readQuery<{ messages: MessageModel[] }>({
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
        <div className={styles.root}>
            <Typography variant={'body1'} className={styles.message}>
                {message.content}
            </Typography>
            <Typography
                variant={'body2'}
                component={'div'}
                className={styles.messageInformation}
            >
                <span className={styles.senderUser}>
                    <UserAvatar
                        user={message.senderUser}
                        className={styles.senderUserAvatar}
                        size={20}
                    />
                    {User.getName(message.senderUser)}
                </span>
                {format(new Date(message.insertedAt), 'PPPpp', { locale: de })}
                {message.senderUser?.id === currentUser?.id && (
                    <Button
                        small
                        icon={<Delete />}
                        aria-label="Nachricht löschen"
                        onClick={() => deleteMessage()}
                    />
                )}
            </Typography>
        </div>
    );
});
