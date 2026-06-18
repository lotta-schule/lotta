import * as React from 'react';
import { AvatarProps } from './Avatar';
import clsx from 'clsx';

import styles from './AvatarGroup.module.scss';

export interface AvatarGroupProps {
  children: React.ReactElement<AvatarProps>[];

  /**
   * The maximum number of avatars to show
   */
  max?: number;

  className?: string;
}

export const AvatarGroup = ({
  max = 3,
  className,
  children,
}: AvatarGroupProps) => {
  const avatars = React.Children.toArray(
    children
  ) as React.ReactElement<AvatarProps>[];
  const overshoot = avatars.length - max;
  return (
    <div className={clsx(styles.root, className)}>
      <div role={'group'}>
        {avatars.splice(0, max).map((child) => {
          return React.cloneElement(child, {
            className: clsx(child.props.className, styles.avatar),
          });
        })}
      </div>
      {overshoot > 0 && <div className={styles.overshoot}>+{overshoot}</div>}
    </div>
  );
};
