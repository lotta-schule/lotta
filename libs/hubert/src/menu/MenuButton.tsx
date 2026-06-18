'use client';

import * as React from 'react';
import { CollectionChildren } from '@react-types/shared';
import { useMenuTriggerState } from 'react-stately';
import { mergeProps, useButton, useMenuTrigger } from 'react-aria';
import { ButtonProps } from '../button/Button';
import {
  Popover,
  PopoverProps,
  PopoverContent,
  PopoverTrigger,
} from '../popover';
import { Menu, WithDescription } from './Menu';

import styles from './MenuButton.module.scss';

export type MenuButtonProps = {
  buttonProps: Omit<ButtonProps, 'ref'>;
  children: CollectionChildren<object>;
  placement?: PopoverProps['placement'];
  onOpenChange?: (_isOpen: boolean) => void;
  onAction?: (_action: React.Key) => void;
  closeOnAction?: boolean;
} & WithDescription;

export const MenuButton = ({
  buttonProps,
  onOpenChange,
  closeOnAction,
  // placement,
  onAction,
  ...props
}: MenuButtonProps) => {
  const onOpenChangeRef = React.useRef(onOpenChange);

  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const ref = React.useRef<HTMLButtonElement>(null!);

  const state = useMenuTriggerState({
    onOpenChange: (isOpen) => {
      onOpenChangeRef.current?.(isOpen);
    },
  });
  const { menuTriggerProps, menuProps } = useMenuTrigger(
    { type: 'menu', isDisabled: buttonProps.disabled },
    state,
    ref
  );

  const { buttonProps: ariaButtonProps } = useButton(menuTriggerProps, ref);

  return (
    <Popover>
      <PopoverTrigger {...buttonProps} {...ariaButtonProps} />
      <PopoverContent>
        <Menu
          {...mergeProps(
            {
              ...menuProps,
              autoFocus: !!menuProps.autoFocus,
            },
            props
          )}
          onAction={onAction}
          closeOnAction={closeOnAction}
          className={styles.menu}
          onClose={state.close}
        >
          {props.children as any}
        </Menu>
      </PopoverContent>
    </Popover>
  );
};
MenuButton.displayName = 'MenuButton';
