import * as React from 'react';
import { Divider } from '../divider/Divider';
import clsx from 'clsx';

import styles from './List.module.scss';

export type ListItemProps = React.HTMLProps<HTMLLIElement> & {
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  isDivider?: boolean;
  isDisabled?: boolean;
  isHeader?: boolean;
  isFocused?: boolean;
  isSelected?: boolean;
};

export const ListItem = ({
  children,
  className,
  isDisabled,
  isFocused,
  isSelected,
  isHeader,
  leftSection,
  rightSection,
  ...props
}: ListItemProps) => {
  if (props.isDivider === true) {
    return (
      <li
        key="listitem"
        className={clsx(styles.li, styles.isDivider, className)}
        {...Object.fromEntries(
          Object.entries(props).filter(([key]) => key !== 'isDivider')
        )}
      >
        <Divider />
      </li>
    );
  }

  return (
    <li
      key="listitem"
      className={clsx(styles.li, className, {
        [styles.isClickable]: props.onClick !== undefined,
        [styles.isDisabled]: isDisabled,
        [styles.isFocused]: isFocused,
        [styles.isSelected]: isSelected,
        [styles.isHeader]: isHeader,
      })}
      {...(isFocused ? { ['data-is-focused']: true } : {})}
      {...props}
    >
      {leftSection && <div>{leftSection}</div>}
      <div className={styles.mainSection}>{children}</div>
      {rightSection && <div>{rightSection}</div>}
    </li>
  );
};
ListItem.displayName = 'ListItem';
