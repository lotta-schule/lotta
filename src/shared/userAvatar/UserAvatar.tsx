import * as React from 'react';
import { Avatar } from '@material-ui/core';
import { AvatarProps } from '@material-ui/core/Avatar';
import { UserModel } from 'model';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useIsRetina } from 'util/useIsRetina';
import { useServerData } from 'shared/ServerDataContext';

export interface UserAvatarProps extends Omit<AvatarProps, 'src' | 'alt'> {
    user: UserModel;
    className?: string;
    size?: number;
}

export const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
    ({ user, size, ...otherProps }, ref) => {
        const { baseUrl } = useServerData();
        const retinaMultiplier = useIsRetina() ? 2 : 1;
        const src = User.getAvatarUrl(
            baseUrl,
            user,
            size ? size * retinaMultiplier : undefined
        );

        return (
            <Avatar
                ref={ref}
                data-testid={'Avatar'}
                src={src}
                style={size ? { width: size, height: size } : {}}
                alt={`Profilbild von ${User.getNickname(user)}`}
                imgProps={{
                    'aria-label': `Profilbild von ${User.getNickname(user)}`,
                }}
                {...otherProps}
            />
        );
    }
);
UserAvatar.displayName = 'UserAvatar';

export const CurrentUserAvatar = React.forwardRef<
    HTMLDivElement,
    Omit<UserAvatarProps, 'user'>
>((props, ref) => {
    const currentUser = useCurrentUser();
    return currentUser ? (
        <UserAvatar ref={ref} user={currentUser} {...props} />
    ) : null;
});
CurrentUserAvatar.displayName = 'CurrentUserAvatar';
