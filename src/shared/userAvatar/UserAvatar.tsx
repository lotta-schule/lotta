import * as React from 'react';
import { Avatar } from 'shared/general/avatar/Avatar';
import { AvatarProps } from 'shared/general/avatar/Avatar';
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

export const UserAvatar = React.memo<UserAvatarProps>(
    ({ user, size, ...otherProps }) => {
        const { baseUrl } = useServerData();
        const retinaMultiplier = useIsRetina() ? 2 : 1;
        const src = User.getAvatarUrl(
            baseUrl,
            user,
            size ? size * retinaMultiplier : undefined
        );

        return (
            <Avatar
                data-testid={'Avatar'}
                src={src}
                style={size ? { width: size, height: size } : {}}
                title={`Profilbild von ${User.getNickname(user)}`}
                {...otherProps}
            />
        );
    }
);
UserAvatar.displayName = 'UserAvatar';

export const CurrentUserAvatar = React.memo<Omit<UserAvatarProps, 'user'>>(
    (props) => {
        const currentUser = useCurrentUser();
        return currentUser ? (
            <UserAvatar user={currentUser} {...props} />
        ) : null;
    }
);
CurrentUserAvatar.displayName = 'CurrentUserAvatar';
