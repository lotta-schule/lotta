import * as React from 'react';
import { Tooltip as ReachTooltip } from '@reach/tooltip';
import clsx from 'clsx';

import styles from './Tooltip.module.scss';

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
    label: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
    children,
    label,
    className,
    ...props
}) => {
    return (
        <ReachTooltip label={label} className={clsx(styles.root, className)} {...props}>
            {children}
        </ReachTooltip>
    );
};
