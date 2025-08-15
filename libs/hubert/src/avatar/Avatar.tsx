import * as React from 'react';
import clsx from 'clsx';

import styles from './Avatar.module.scss';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * The title of the avatar
   */
  title?: string;

  className?: string;
}

export const Avatar = React.memo(
  ({ src, title, className, role, style, onClick, ...props }: AvatarProps) => {
    return (
      <div
        {...props}
        role={role || 'img'}
        title={title}
        onClick={onClick}
        className={clsx(styles.root, className, {
          [styles.clickable]: !!onClick,
        })}
        style={{ ...style, backgroundImage: `url(${src})` }}
      />
    );
  }
);
Avatar.displayName = 'Avatar';
