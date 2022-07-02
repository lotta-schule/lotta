import * as React from 'react';
import { Tooltip as ReachTooltip } from '@reach/tooltip';
import clsx from 'clsx';

import styles from './Tooltip.module.scss';

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
    label: React.ReactNode;
}

export const Tooltip = React.forwardRef(
    (
        { children, label, className, ...props }: TooltipProps,
        ref: React.ForwardedRef<HTMLDivElement>
    ) => {
        return (
            <ReachTooltip
                ref={ref}
                label={label}
                className={clsx(styles.root, className)}
                {...props}
            >
                {children}
            </ReachTooltip>
        );
    }
);
Tooltip.displayName = 'Tooltip';
