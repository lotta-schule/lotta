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
    const {
      menuTriggerProps: {
        onPressStart: menuTriggerPropsPressStart,
        ...otherMenuTriggerProps
      },
      menuProps,
    } = useMenuTrigger(
      { type: 'menu', isDisabled: buttonProps.disabled },
      state,
      ref
    );

    // useMenuTrigger does react on onPressStart (for non-touch devices only),
    // https://github.com/adobe/react-spectrum/blob/5e49ce79094a90839cec20fc5ce788a34bf4b085/packages/%40react-aria/menu/src/useMenuTrigger.ts#L113
    // Problem is, when the user clicks on the button, the menu slides up with an animation,
    // and when the user releases the mouse button in less then about 300ms (which is often),
    // the menu closes again because the mouseup triggers the click event in the menu
    // To prevent this, we replace onPressStart with a simple good 'ol "onClick"
    const menuTriggerProps = {
      onClick: menuTriggerPropsPressStart,
      ...otherMenuTriggerProps,
    };

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
