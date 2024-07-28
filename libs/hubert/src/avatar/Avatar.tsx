import * as React from 'react';
import clsx from 'clsx';

import styles from './Avatar.module.scss';

export interface AvatarProps
  extends Omit<React.HTMLProps<HTMLDivElement>, 'ref'> {
  /**
   * The avatar image source
   */
  src: string;

  /**
   * The title of the avatar
   */
  title?: string;

  className?: string;

  style?: React.CSSProperties;
}

export const Avatar = React.memo(
  ({ src, title, className, role, style, ...props }: AvatarProps) => {
    return (
      <div
        {...props}
        role={role || 'img'}
        title={title}
        className={clsx(styles.root, className)}
        style={{ ...style, backgroundImage: `url(${src})` }}
      />
    );
  }
);
Avatar.displayName = 'Avatar';
