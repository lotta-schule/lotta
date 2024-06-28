import * as React from 'react';
import { Avatar, AvatarProps } from '@lotta-schule/hubert';
import { UserModel } from 'model';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useIsRetina } from 'util/useIsRetina';
import { useServerData } from 'shared/ServerDataContext';
import { useTranslation } from 'react-i18next';

export interface UserAvatarProps extends Omit<AvatarProps, 'src' | 'alt'> {
  user: UserModel;
  className?: string;
  size?: number;
}

export const UserAvatar = React.memo(
  React.forwardRef(
    (
      { user, size, ...otherProps }: UserAvatarProps,
      ref: React.ForwardedRef<HTMLDivElement>
    ) => {
      const { t } = useTranslation();
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
          ref={ref}
          style={size ? { width: size, height: size } : {}}
          title={t('Avatar of {{name}}', { name: User.getNickname(user) })}
          {...otherProps}
        />
      );
    }
  )
);
UserAvatar.displayName = 'UserAvatar';

export const CurrentUserAvatar = React.memo(
  React.forwardRef(
    (
      props: Omit<UserAvatarProps, 'user'>,
      ref: React.ForwardedRef<HTMLDivElement>
    ) => {
      const currentUser = useCurrentUser();
      return currentUser ? (
        <UserAvatar user={currentUser} ref={ref} {...props} />
      ) : null;
    }
  )
);
CurrentUserAvatar.displayName = 'CurrentUserAvatar';
