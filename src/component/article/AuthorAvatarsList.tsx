import React, { memo } from 'react';
import { UserModel } from 'model';
import { makeStyles, Tooltip, Avatar } from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import { User } from 'util/model';
import clsx from 'clsx';

export interface AuthorAvatarsListProps {
    users: UserModel[];
    className?: string;
    max?: number;
}

const useStyles = makeStyles(() => ({
    root: {
        display: 'inline-flex',
    },
    authorAvatar: {
        width: '1em',
        height: '1em',
        borderWidth: 1,
        '@media screen and (-webkit-min-device-pixel-ratio: 2), screen and (min-resolution: 2dppx)': {
            borderWidth: .5,
        }
    },
}));

export const AuthorAvatarsList = memo<AuthorAvatarsListProps>(({ users, className, max }) => {
    const styles = useStyles();
    if (!users) {
        return null;
    }
    return (
        <AvatarGroup max={max ?? 3} classes={{ root: clsx(styles.root, className), avatar: styles.authorAvatar }}>
            {users.map(user => (
                <Tooltip title={User.getNickname(user)} key={user.id}>
                    <Avatar src={User.getAvatarUrl(user, 40)} />
                </Tooltip>
            ))}
        </AvatarGroup>
    )
});