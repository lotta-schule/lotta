import * as React from 'react';
import { useTooltip } from '@react-aria/tooltip';
import { TooltipTriggerState } from '@react-stately/tooltip';
import { mergeProps } from '@react-aria/utils';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

import styles from './Tooltip.module.scss';

export interface TooltipOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
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
