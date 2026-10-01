'use client';

import * as React from 'react';
import { mergeProps, useTooltip } from 'react-aria';
import { TooltipTriggerState } from 'react-stately';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

import styles from './Tooltip.module.scss';

export interface TooltipOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string | React.ReactElement;
  state: TooltipTriggerState;
}

export const TooltipOverlay = React.memo(
  React.forwardRef(
    (
      { state, label, className, ...props }: TooltipOverlayProps,
      ref: React.ForwardedRef<HTMLDivElement>
    ) => {
      const { tooltipProps } = useTooltip(props, state);
      return (
        <AnimatePresence>
          {state.isOpen && (
            <motion.div
              className={clsx(className, styles.tooltip)}
              initial={{ opacity: 0, y: '-100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              ref={ref}
              {...(mergeProps(props, tooltipProps) as any)}
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      );
    }
  )
);
TooltipOverlay.displayName = 'TooltipOverlay';
