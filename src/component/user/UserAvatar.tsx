import React, { memo, useMemo } from 'react';
import { UserModel } from 'model';
import { Avatar } from '@material-ui/core';
import { AvatarProps } from '@material-ui/core/Avatar';
import { useCurrentUser } from 'util/user/useCurrentUser';

export interface UserAvatarProps extends Omit<AvatarProps, 'src' | 'alt'> {
    user: UserModel;
    className?: string;
}

export const UserAvatar = memo<UserAvatarProps>(({ user, ...otherProps }) => {
    const src = useMemo(() => {
        return `https://avatars.dicebear.com/v2/avataaars/${user.email}.svg`;
    }, [user]);
    return (
        <Avatar src={src} alt={user.name} {...otherProps} />
    );
});

export const CurrentUserAvatar = memo<Omit<UserAvatarProps, 'user'>>(props => {
    const currentUser = useCurrentUser();
    return currentUser && <UserAvatar user={currentUser} {...props} />;
});