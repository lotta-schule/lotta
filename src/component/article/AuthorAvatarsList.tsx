import React, { memo } from 'react';
import { UserModel } from 'model';
import { makeStyles, Tooltip, Avatar } from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import { User } from 'util/model';
import clsx from 'clsx';
import { theme } from 'theme';

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
        width: '2em',
        height: '2em',
        fontSize: '1rem',
        boxShadow: '1px 1px 7px #0000002e',
        borderWidth: 0,
        backgroundColor: theme.palette.grey[400] ,
    },
}));

export const AuthorAvatarsList = memo<AuthorAvatarsListProps>(({ users, className, max }) => {
    const styles = useStyles();
    if (!users) {
        return null;
    }
    return (
        <AvatarGroup max={max ?? 2} classes={{ root: clsx(styles.root, className), avatar: styles.authorAvatar }}>
            {users.map(user => (
                <Tooltip title={User.getNickname(user)} key={user.id}>
                    <Avatar src={User.getAvatarUrl(user, 40)} />
                </Tooltip>
            ))}
        </AvatarGroup>
    )
});