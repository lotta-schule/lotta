import * as React from 'react';
import clsx from 'clsx';

import styles from './Avatar.module.scss';

export interface AvatarProps extends React.DetailedHTMLProps<HTMLImageElement> {
  /**
   * The title of the avatar
   */
  title?: string;

  className?: string;
}

export const Avatar = React.memo(({ className, ...props }: AvatarProps) => {
  return <img {...props} className={clsx(styles.root, className)} />;
});
Avatar.displayName = 'Avatar';
