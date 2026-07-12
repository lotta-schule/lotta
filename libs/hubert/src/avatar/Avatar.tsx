import * as React from 'react';
import clsx from 'clsx';

import styles from './Avatar.module.scss';

export interface AvatarProps extends Omit<
  React.HTMLProps<HTMLDivElement>,
  'ref'
> {
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
          .trim()
          .split(' ')
          .map((part, i) => (i === 0 ? `url(${part})` : part))
          .join(' ')
      )
      .join(', ');

    const backgroundImage = imageSet ? `image-set(${imageSet})` : `url(${src})`;

    return (
      // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- role is always set ('button' when onClick, 'img' otherwise); linter can't evaluate the ternary expression
      <div
        {...props}
        role={role || (onClick ? 'button' : 'img')}
        tabIndex={!role && onClick ? 0 : undefined}
        title={title}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        className={clsx(styles.root, className, {
          [styles.clickable]: !!onClick,
        })}
        style={{
          ...style,
          backgroundImage,
        }}
      />
    );
  }
);
Avatar.displayName = 'Avatar';
