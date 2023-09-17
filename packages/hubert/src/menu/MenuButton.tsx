'use client';

import * as React from 'react';
import { CollectionChildren } from '@react-types/shared';
import { useMenuTriggerState } from 'react-stately';
import { mergeProps, useButton, useMenuTrigger } from 'react-aria';
import { Button, ButtonProps } from '../button/Button';
import { Popover, PopoverProps } from '../popover/new/Popover';
import { Menu, WithDescription } from './Menu';

import styles from './MenuButton.module.scss';

export type MenuButtonProps = {
  buttonProps: Omit<ButtonProps, 'ref'>;
  children: CollectionChildren<object>;
  placement?: PopoverProps['placement'];
  onOpenChange?: (_isOpen: boolean) => void;
  onAction?: (_action: React.Key) => void;
} & WithDescription;

export const MenuButton = React.forwardRef(
  (
    { buttonProps, onOpenChange, placement, ...props }: MenuButtonProps,
    forwardedRef: React.Ref<HTMLButtonElement | null>
  ) => {
    const onOpenChangeRef = React.useRef(onOpenChange);

    React.useEffect(() => {
      onOpenChangeRef.current = onOpenChange;
    }, [onOpenChange]);

    const isBrowser = typeof window !== 'undefined';

    const ref = React.useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(forwardedRef, () => ref.current);

    const state = useMenuTriggerState({});
    const { menuTriggerProps, menuProps } = useMenuTrigger(
      { type: 'menu', isDisabled: buttonProps.disabled },
      state,
      ref
    );

    React.useEffect(() => {
      onOpenChangeRef.current?.(state.isOpen);
    }, [state.isOpen]);

    const element = React.useRef<HTMLDivElement | null>(null);
    const { buttonProps: ariaButtonProps } = useButton(menuTriggerProps, ref);

    React.useEffect(() => () => element.current?.remove(), []);

    if (isBrowser && element.current === null) {
      element.current = document.createElement('div');
      const dialogContainer =
        document.getElementById('dialogContainer') ||
        (() => {
          const container = document.createElement('div');
          container.id = 'dialogContainer';
          document.body.appendChild(container);
          return container;
        })();
      dialogContainer.appendChild(element.current);
    }

    return (
      <>
        <Button ref={ref} {...buttonProps} {...ariaButtonProps} />
        {ref.current && (
          <Popover
            isOpen={state.isOpen}
            onClose={state.close}
            placement={placement}
            triggerRef={ref}
          >
            <Menu
              {...mergeProps(
                {
                  ...menuProps,
                  autoFocus: !!menuProps.autoFocus,
                },
                props
              )}
              className={styles.menu}
              onClose={state.close}
            >
              {props.children as any}
            </Menu>
          </Popover>
        )}
      </>
    );
  }
);
MenuButton.displayName = 'MenuButton';
