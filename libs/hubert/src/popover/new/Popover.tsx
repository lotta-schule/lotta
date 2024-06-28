'use client';

import * as React from 'react';
import { mergeProps, DismissButton, FocusScope, useOverlay } from 'react-aria';
import { PopperProps, usePopper } from 'react-popper';
import { VirtualElement } from '@popperjs/core';

export type PopoverProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  placement?: PopperProps<unknown>['placement'];
  trigger: Element | VirtualElement;
};

export const Popover = React.forwardRef(
  (
    { children, isOpen, onClose, placement, trigger }: PopoverProps,
    forwardedRef: React.Ref<HTMLDivElement | null>
  ) => {
    const [triggerElement, setTriggerElement] = React.useState<
      Element | VirtualElement | null
    >(null);
    const [popoverElement, setPopoverElement] =
      React.useState<HTMLElement | null>(null);

    const ref = React.useRef<HTMLDivElement>(null!);
    React.useImperativeHandle(forwardedRef, () => ref.current);

    const { overlayProps } = useOverlay(
      {
        onClose,
        isOpen,
        isDismissable: true,
      },
      ref
    );

    const { styles: popperStyle, attributes: popperProps } = usePopper(
      triggerElement,
      popoverElement,
      {
        placement,
        strategy: 'fixed',
      }
    );

    React.useLayoutEffect(() => {
      setTriggerElement(trigger);
    }, [trigger]);

    React.useLayoutEffect(() => {
      if (isOpen) {
        setPopoverElement(ref.current);
      } else {
        setPopoverElement(null);
      }
    }, [isOpen]);

    return (
      <div
        key={'Popover'}
        {...(mergeProps(overlayProps, popperProps.popper ?? {}) as any)}
        style={{ ...popperStyle.popper, zIndex: 100_000 }}
        ref={ref}
      >
        {popoverElement && (
          <FocusScope restoreFocus>
            <DismissButton onDismiss={onClose} />
            {children}
          </FocusScope>
        )}
      </div>
    );
  }
);
Popover.displayName = 'Popover';
