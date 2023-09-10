import * as React from 'react';
import clsx from 'clsx';

import styles from './Avatar.module.scss';

export interface AvatarProps {
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
  React.forwardRef(
    (
      { src, title, className, style }: AvatarProps,
      ref: React.ForwardedRef<HTMLDivElement>
    ) => {
      return (
        <div
          role={'img'}
          title={title}
          ref={ref}
          className={clsx(styles.root, className)}
          style={{ ...style, backgroundImage: `url(${src})` }}
        />
      );
    }
  )
);
Avatar.displayName = 'Avatar';
