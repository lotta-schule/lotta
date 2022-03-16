import * as React from 'react';
import clsx from 'clsx';

import styles from './Table.module.scss';

export type TableProps = React.HTMLProps<HTMLTableElement>;

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <table
                ref={ref}
                className={clsx(styles.root, className)}
                {...props}
            >
                {children}
            </table>
        );
    }
);
Table.displayName = 'Table';
