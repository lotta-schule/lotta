'use client';

import * as React from 'react';
import { mergeProps, DismissButton, FocusScope, useOverlay } from 'react-aria';
import { PopperProps, usePopper } from 'react-popper';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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

    const ref = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => ref.current);

    const shouldReduceMotion = useReducedMotion();

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
      setPopoverElement(ref.current);
    }, [trigger]);

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={'Popover'}
            initial={{
              height: 0,
              opacity: 0,
              pointerEvents: shouldReduceMotion ? 'auto' : 'none',
            }}
            animate={{
              height: 'auto',
              opacity: 1,
              pointerEvents: 'auto',
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: 0.3,
                    opacity: { type: 'ease-in-out', duration: 0.2 },
                    pointerEvents: { delay: 0.2 },
                  }
            }
            {...(mergeProps(overlayProps, popperProps.popper ?? {}) as any)}
            style={{ ...popperStyle.popper, zIndex: 10_000 }}
            ref={ref}
          >
            <FocusScope restoreFocus>
              <DismissButton onDismiss={onClose} />
              {children}
            </FocusScope>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
Popover.displayName = 'Popover';
