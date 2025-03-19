import * as React from 'react';
import { Avatar, AvatarProps } from '@lotta-schule/hubert';
import { UserModel } from 'model';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { useIsRetina } from 'util/useIsRetina';
import { useTranslation } from 'react-i18next';
import { useResponsiveProps } from 'util/image/ResponsiveImage';

export interface UserAvatarProps extends Omit<AvatarProps, 'src' | 'alt'> {
  user: Pick<UserModel, 'avatarImageFile' | 'name' | 'nickname'>;
  className?: string;
  size?: number;
}

export const UserAvatar = React.memo(
  ({ user, size, ...props }: UserAvatarProps) => {
    const possibleSizes = React.useMemo(() => [50, 100, 250, 500], []);
    const firstSizeIndex =
      React.useMemo(
        () => size && possibleSizes.findIndex((s) => s >= size),
        [size, possibleSizes]
      ) || 0;
    const { t } = useTranslation();
    const retinaMultiplier = useIsRetina() ? 2 : 1;
    const { formats: _formats, ...responsiveProps } = useResponsiveProps(
      user.avatarImageFile,
      'avatar',
      [
        possibleSizes[firstSizeIndex] || 50,
        possibleSizes.at(firstSizeIndex + 1) ||
          possibleSizes[firstSizeIndex] ||
          50,
      ]
    );
    const src = User.getAvatarUrl(
      user,
      size ? size * retinaMultiplier : undefined
    );

    return (
      <Avatar
        data-testid={'Avatar'}
        src={src}
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
