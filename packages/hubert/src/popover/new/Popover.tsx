'use client';

import * as React from 'react';
import { DismissButton, useOverlay } from '@react-aria/overlays';
import { FocusScope } from '@react-aria/focus';
import { mergeProps } from '@react-aria/utils';
import { PopperProps, usePopper } from 'react-popper';
import { AnimatePresence, motion } from 'framer-motion';
import { CollectionChildren } from '@react-types/shared';
import { ListItemPreliminaryItem } from '../../list/ListItemFactory';

export type PopoverProps = {
  children: CollectionChildren<ListItemPreliminaryItem>;
  isOpen: boolean;
  onClose: () => void;
  placement?: PopperProps<{}>['placement'];
  triggerRef: React.RefObject<HTMLElement>;
};

export const Popover = React.forwardRef(
  (
    { children, isOpen, onClose, placement, triggerRef }: PopoverProps,
    forwardedRef: React.Ref<HTMLDivElement | null>
  ) => {
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
      triggerRef.current,
      ref.current,
      {
        placement,
        strategy: 'fixed',
      }
    );

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={'Popover'}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            {...(mergeProps(overlayProps, popperProps.popper ?? {}) as any)}
            style={{ ...popperStyle.popper, zIndex: 10 }}
            ref={ref}
          >
            <FocusScope restoreFocus>
              <DismissButton onDismiss={onClose} />
              {children as any}
            </FocusScope>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
Popover.displayName = 'Popover';
