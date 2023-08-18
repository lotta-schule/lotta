import * as React from 'react';
import { useTooltipTrigger } from '@react-aria/tooltip';
import { useTooltipTriggerState } from '@react-stately/tooltip';
import { mergeProps } from '@react-aria/utils';
import { TooltipOverlay } from './TooltipOverlay';

import styles from './Tooltip.module.scss';

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement;
  label?: string | React.ReactElement<{}>;
  /**
   * The delay time for the tooltip to show up
   * @default 750
   */
  delay?: number;
}

export const Tooltip = React.forwardRef(
  (
    { children, className, label, delay = 750, ...props }: TooltipProps,
    forwardedRef: React.Ref<HTMLDivElement | null>
  ) => {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => ref.current);

    const isDisabled = ref.current?.getAttribute('disabled') !== null;

    const state = useTooltipTriggerState({ delay, isDisabled });

    const { triggerProps, tooltipProps } = useTooltipTrigger(
      { delay, isDisabled },
      state,
      ref
    );

    return (
      <div className={styles.root}>
        <div className={styles.trigger} ref={ref} {...triggerProps}>
          {children}
        </div>
        <TooltipOverlay
          className={className}
          state={state}
          label={label ?? children}
          {...mergeProps(props, tooltipProps)}
        />
      </div>
    );
  }
);
Tooltip.displayName = 'Tooltip';
