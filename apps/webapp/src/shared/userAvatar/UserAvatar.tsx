'use client';

import * as React from 'react';
import { Avatar, AvatarProps } from '@lotta-schule/hubert';
import { UserModel } from 'model';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useTranslation } from 'react-i18next';
import { useResponsiveProps } from 'util/image/ResponsiveImage';

export type UserAvatarProps = Omit<AvatarProps, 'src' | 'alt'> & {
  user: Pick<UserModel, 'avatarImageFile' | 'name' | 'nickname'>;
  className?: string;
  size?: number;
};

export const UserAvatar = React.memo(
  ({ user, size = 100, ...props }: UserAvatarProps) => {
    const { t } = useTranslation();

    const sizes = React.useMemo(() => {
      const availableSizes = [50, 100, 250, 500, 1000];
      const matchingIndex = availableSizes.findIndex((s) => s >= size) || 0;

      return availableSizes.splice(matchingIndex, 2) as [number, number];
    }, [size]);

    const { formats: _formats, ...responsiveProps } = useResponsiveProps(
      user.avatarImageFile,
      'avatar',
      sizes
    );

    return (
      <Avatar
        loading="lazy"
        data-testid={'Avatar'}
        src={User.getDefaultAvatarUrl(user)}
        style={size ? { width: size, height: size } : {}}
        title={t('Avatar of {{name}}', { name: User.getNickname(user) })}
        {...props}
        {...responsiveProps}
      />
    );
  }
);
UserAvatar.displayName = 'UserAvatar';

export const CurrentUserAvatar = React.memo(
  (props: Omit<UserAvatarProps, 'user'>) => {
    const currentUser = useCurrentUser();
    return currentUser ? <UserAvatar user={currentUser} {...props} /> : null;
  }
);
CurrentUserAvatar.displayName = 'CurrentUserAvatar';
