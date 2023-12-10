'use client';

import * as React from 'react';
import { mergeProps, DismissButton, FocusScope, useOverlay } from 'react-aria';
import { PopperProps, usePopper } from 'react-popper';
import { AnimatePresence, motion } from 'framer-motion';

export type PopoverProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  placement?: PopperProps<unknown>['placement'];
  triggerRef: React.RefObject<HTMLElement>;
};

export const Popover = React.forwardRef(
  (
    { children, isOpen, onClose, placement, triggerRef }: PopoverProps,
    forwardedRef: React.Ref<HTMLDivElement | null>
  ) => {
    const [triggerElement, setTriggerElement] =
      React.useState<HTMLElement | null>(null);
    const [popoverElement, setPopoverElement] =
      React.useState<HTMLElement | null>(null);
    const ref = React.useRef<HTMLDivElement>(null);
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
      setTriggerElement(triggerRef.current);
      setPopoverElement(ref.current);
    });

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={'Popover'}
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              opacity: { type: 'ease-in-out', duration: 0.2 },
            }}
            {...(mergeProps(overlayProps, popperProps.popper ?? {}) as any)}
            style={{ ...popperStyle.popper, zIndex: 10 }}
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
