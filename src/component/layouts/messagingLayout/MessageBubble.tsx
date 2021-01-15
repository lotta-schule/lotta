import React, { memo } from 'react';
import { fade, makeStyles, Theme, Typography } from '@material-ui/core';
import { MessageModel } from 'model';
import { UserAvatar } from 'component/user/UserAvatar';
import { format } from 'date-fns';
import de from 'date-fns/locale/de';

export interface MessageBubbleProps {
    active?: boolean;
    message: MessageModel;
}

const useStyles = makeStyles<Theme, MessageBubbleProps>(theme => {
    const withBaseColor  = (fn: (baseColor: string) => any = bg => bg) => {
        return ({ active }: MessageBubbleProps) =>  fn(theme.palette[active ? 'primary' : 'secondary'].main);
    };
    return {
        root: {
            padding: theme.spacing(1, 2),
            marginBottom: theme.spacing(4),
            cursor: 'default',
            position: 'relative',
            marginLeft: ({ active }) => active ? '3em' : 'initial',
            marginRight: ({ active }) => active ? 'initial' : '3em',

            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: withBaseColor(),
            borderRadius: theme.shape.borderRadius,
            backgroundColor: withBaseColor(bg => fade(bg, .15)),
            '&:after': {
                content: ({ active }) => active ? '""' : 'initial',
                borderLeftWidth: 20,
                borderLeftStyle: 'solid',
                borderLeftColor: theme.palette.background.paper,
                borderTopWidth: 20,
                borderTopStyle: 'solid',
                borderTopColor: withBaseColor(bg => fade(bg, .15)),
                backgroundColor: withBaseColor(),
                bottom: -20,
                position: 'absolute',
                left: ({ active }) => active ? 'initial' : 20,
                right: ({ active }) => active ? 20 : 'initial',
            }
        },
        message: {
            paddingBotttom: theme.spacing(1)
        },
        senderUser: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        },
        senderUserAvatar: {
            height: '1em',
            width: '1em',
            display: 'inline-block',
            marginRight: '.25em'
        },
        messageInformation: {
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: theme.spacing(1),
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: fade(theme.palette.secondary.main, .3)
        }
    };
});

export const MessageBubble = memo<MessageBubbleProps>(props => {
    const styles = useStyles(props);
    const { message } = props;
    return (
        <div className={styles.root}>
            <Typography variant={'body1'} className={styles.message}>
                {message.content}
            </Typography>
            <Typography variant={'body2'} component={'div'} className={styles.messageInformation}>
                <span className={styles.senderUser}>
                    <UserAvatar user={message.senderUser} className={styles.senderUserAvatar} size={20} />
                    {User.getNickname(message.senderUser)}
                </span>
                {format(new Date(message.insertedAt), 'PPPpp', { locale: de })}
            </Typography>
        </div>
    );
});
