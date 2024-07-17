import {} from 'react';
import { Button, ButtonProps } from './Button';

import styles from './PillButton.module.scss';
import clsx from 'clsx';

export type PillButtonProps = Omit<ButtonProps, 'onlyIcon'>;

export const PillButton = ({ className, ...props }: PillButtonProps) => {
  return (
    <Button
      onlyIcon
      className={clsx(className, styles.root, styles.button)}
      {...props}
    />
  );
};
