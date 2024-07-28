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
  trigger: Element | VirtualElement | null;
} & Pick<React.HTMLProps<HTMLDivElement>, 'ref'>;

export const Popover = ({
  children,
  isOpen,
  onClose,
  placement,
  trigger,
  ref,
}: PopoverProps) => {
  const [triggerElement, setTriggerElement] = React.useState<
    Element | VirtualElement | null
  >(null);
  const [popoverElement, setPopoverElement] =
    React.useState<HTMLElement | null>(null);

  const internalRef = React.useRef<HTMLDivElement>(null);

  const { overlayProps } = useOverlay(
    {
      onClose,
      isOpen,
      isDismissable: true,
    },
    internalRef
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
      setPopoverElement(internalRef.current);
    } else {
      setPopoverElement(null);
    }
  }, [isOpen]);

  return (
    <div
      key={'Popover'}
      {...(mergeProps(overlayProps, popperProps.popper ?? {}) as any)}
      style={{ ...popperStyle.popper, zIndex: 100_000 }}
      ref={(node) => {
        if (ref) {
          if ('current' in ref) {
            ref.current = node;
          } else {
            ref(node);
          }
        }
        internalRef.current = node;
        return () => {
          if (ref) {
            if ('current' in ref) {
              ref.current = null;
            } else {
              ref(null);
            }
            internalRef.current = null;
          }
        };
      }}
    >
      {popoverElement && (
        <FocusScope restoreFocus>
          <DismissButton onDismiss={onClose} />
          {children}
        </FocusScope>
      )}
    </div>
  );
};
Popover.displayName = 'Popover';
