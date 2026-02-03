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
  ({
    src,
    srcSet,
    title,
    className,
    role,
    style,
    onClick,
    ...props
  }: AvatarProps) => {
    const imageSet = srcSet
      ?.split(',')
      .map((s) =>
        s
          .split(' ')
          .map((part, i) => (i === 0 ? `url(${part})` : part))
          .join(' ')
      )
      .join(', ');

    return (
      <div
        {...props}
        role={role || 'img'}
        title={title}
        onClick={onClick}
        className={clsx(styles.root, className, {
          [styles.clickable]: !!onClick,
        })}
        style={{
          ...style,
          backgroundImage: imageSet ? `image-set(${imageSet})` : `url(${src})`,
        }}
      />
    );
  }
);
Avatar.displayName = 'Avatar';
