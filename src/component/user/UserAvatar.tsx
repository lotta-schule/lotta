import React, { memo } from 'react';
import { Avatar } from '@material-ui/core';
import { AvatarProps } from '@material-ui/core/Avatar';
import { UserModel } from 'model';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useIsRetina } from 'util/useIsRetina';

export interface UserAvatarProps extends Omit<AvatarProps, 'src' | 'alt'> {
    user: UserModel;
    className?: string;
    size?: number;
}

export const UserAvatar = memo<UserAvatarProps>(({ user, size, ...otherProps }) => {
    const retinaMultiplier = useIsRetina() ? 2 : 1;
    const src = User.getAvatarUrl(user, size ? (size * retinaMultiplier) : undefined);

    return (
        <Avatar src={src} alt={`Profilbild von ${User.getNickname(user)}`} {...otherProps} />
    );
});

export const CurrentUserAvatar = memo<Omit<UserAvatarProps, 'user'>>(props => {
    const currentUser = useCurrentUser();
    return currentUser ?
        <UserAvatar user={currentUser} {...props} /> :
        null;
});
