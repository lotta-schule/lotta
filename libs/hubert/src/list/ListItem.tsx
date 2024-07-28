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
  const internalRef = React.useRef<HTMLLIElement>(null);
  if (props.isDivider === true) {
    return (
      <li
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
      className={clsx(styles.li, className, {
        [styles.isClickable]: props.onClick !== undefined,
        [styles.isDisabled]: isDisabled,
        [styles.isFocused]: isFocused,
        [styles.isSelected]: isSelected,
        [styles.isHeader]: isHeader,
      })}
      {...(isFocused ? { ['data-is-focused']: true } : {})}
      {...props}
      ref={(node) => {
        if (props.ref) {
          if ('current' in props.ref) {
            props.ref.current = node;
          } else {
            props.ref(node);
          }
        }
        internalRef.current = node;
        return () => {
          if (props.ref) {
            if ('current' in props.ref) {
              props.ref.current = null;
            } else {
              props.ref(null);
            }
          }
          internalRef.current = null;
        };
      }}
    >
      {leftSection && <div>{leftSection}</div>}
      <div className={styles.mainSection}>{children}</div>
      {rightSection && <div>{rightSection}</div>}
    </li>
  );
};
ListItem.displayName = 'ListItem';
