import * as React from 'react';
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';
import clsx from 'clsx';

import styles from './Icon.module.scss';

export type IconProps = Omit<FontAwesomeIconProps, 'size'> & {
  size?: FontAwesomeIconProps['size'] | 'xl';
  color?: 'primary' | 'secondary' | 'error';
};

export const Icon = React.memo(({ className, ...props }: IconProps) => {
  return (
    <span
      className={clsx(styles.root, className, {
        [styles.secondaryColor]: props.color == 'secondary',
        [styles.errorColor]: props.color == 'error',
      })}
    >
      <FontAwesomeIcon {...(props as FontAwesomeIconProps)} />
    </span>
  );
});
Icon.displayName = 'Icon';
