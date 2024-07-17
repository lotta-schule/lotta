import { Button, ButtonProps } from './Button';
import clsx from 'clsx';

import styles from './PillButton.module.scss';

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
