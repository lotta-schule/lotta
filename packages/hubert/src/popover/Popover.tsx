'use client';
import * as React from 'react';
import { useOverlayTrigger } from '@react-aria/overlays';
import { useOverlayTriggerState } from '@react-stately/overlays';
import { useButton } from '@react-aria/button';
import { Button, ButtonProps } from '../button';
import { PopoverOverlay } from './PopoverOverlay';
import { usePopper } from 'react-popper';

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  buttonProps?: ButtonProps;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

export const Popover = ({
  buttonProps,
  style,
  children,
  ...divProps
}: PopoverProps) => {
  const state = useOverlayTriggerState({});

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const { styles: popperStyles, attributes: popperAttributes } = usePopper(
    triggerRef.current,
    overlayRef.current,
    { placement: 'auto', strategy: 'fixed' }
  );

  const { triggerProps, overlayProps } = useOverlayTrigger(
    { type: 'dialog' },
    state,
    triggerRef
  );

  const { buttonProps: buttonAttributes } = useButton(
    {
      onPress: () => state.open(),
    },
    triggerRef
  );

  const triggerElement = React.useMemo(
    () =>
      React.createElement(Button, {
        ...triggerProps,
        ...buttonAttributes,
        ...buttonProps,
        ref: triggerRef,
      }),
    [buttonAttributes, buttonProps, triggerProps]
  );

  return (
    <>
      {triggerElement}
      {state.isOpen && (
        <PopoverOverlay
          {...overlayProps}
          {...popperAttributes.popper}
          {...divProps}
          style={{ ...popperStyles.popper, ...style }}
          ref={overlayRef}
          isOpen={state.isOpen}
          onClose={state.close}
        >
          {children}
        </PopoverOverlay>
      )}
    </>
  );
};
