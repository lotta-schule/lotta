import * as React from 'react';
import clsx from 'clsx';

import styles from './Table.module.scss';

export type TableProps = React.HTMLProps<HTMLTableElement>;

export const Table: React.FC<TableProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <table className={clsx(styles.root, className)} {...props}>
            {children}
        </table>
    );
};
