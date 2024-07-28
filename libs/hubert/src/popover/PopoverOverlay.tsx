'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { DismissButton, FocusScope, useOverlay } from 'react-aria';
import { Box } from '../layout';
import clsx from 'clsx';

import styles from './PopoverOverlay.module.scss';

export type PopoverOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
} & React.HTMLProps<HTMLDivElement>;

const AnimatedBox = motion(Box);

export const PopoverOverlay = ({
  children,
  isOpen,
  onClose,
  className,
  style,
  ...props
}: PopoverOverlayProps) => {
  const internalRef = React.useRef<HTMLDivElement>(null);
  const { overlayProps } = useOverlay(
    {
      onClose,
      isOpen,
      isDismissable: true,
    },
    internalRef
  );

  return (
    <FocusScope restoreFocus>
      <AnimatedBox
        role={'presentation'}
        {...(overlayProps as any)}
        {...props}
        className={clsx(styles.root, className)}
        style={style}
        ref={(node: HTMLDivElement) => {
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
        initial={'closed'}
        animate={isOpen ? 'open' : 'closed'}
        variants={{
          open: { opacity: 1, height: 'auto', y: 0 },
          closed: { opacity: 0, height: 0, y: -50 },
        }}
      >
        {children}
        <DismissButton onDismiss={onClose} />
      </AnimatedBox>
    </FocusScope>
  );
};
PopoverOverlay.displayName = 'PopoverOverlay';
