import React, { memo } from 'react';
import { makeStyles, Button, Typography, Badge } from '@material-ui/core';
import { UserModel, UserGroupModel } from 'model';
import { UserAvatar } from 'component/user/UserAvatar';
import { format } from 'date-fns';
import { useNewMessagesBadgeNumber } from '../navigation/useNewMessagesBadgeNumber';
import { User } from 'util/model';
import de from 'date-fns/locale/de';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
    root: {
        background: theme.palette.background.paper,
        margin: theme.spacing(1, 0),
        padding: theme.spacing(1),
        overflow: 'auto',
        display: 'block',
        width: '100%',
        '&.selected': {
            position: 'sticky',
            top: `calc(65px + ${theme.spacing(1)}px)`,
            zIndex: 1,
            borderLeftWidth: theme.spacing(1),
            borderLeftStyle: 'solid',
            borderLeftColor: theme.palette.secondary.main
        }
    },
    buttonLabel: {
        textAlign: 'left'
    },
    userAvatar: {
        float: 'right',
        width: 40,
        height: 40
    }
}));

export interface ThreadPreviewProps {
    counterpart: UserModel | UserGroupModel;
    selected?: boolean;
    date?: Date;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const ThreadPreview = memo<ThreadPreviewProps>(({ selected, counterpart, date, onClick }) => {
    const styles = useStyles();
    const newMessagesBadgeNumber = useNewMessagesBadgeNumber((counterpart as UserModel).avatarImageFile !== undefined ? { user: counterpart as UserModel } : { group: counterpart as UserGroupModel });

    return (
        <Button
            onClick={onClick}
            className={clsx(styles.root, { selected })}
            classes={{ label: styles.buttonLabel }}
        >
            <Typography variant={'subtitle1'}>
                <Badge badgeContent={newMessagesBadgeNumber} color={'primary'}>
                    {User.getName(counterpart as UserModel)}
                </Badge>
                {(counterpart as UserModel).avatarImageFile && (
                    <UserAvatar user={counterpart as UserModel} size={50} classes={{ root: styles.userAvatar }} />
                )}
            </Typography>
            <Typography variant={'body2'}>
                {date && format(date, 'P', { locale: de })}
            </Typography>
        </Button>
    );
});
