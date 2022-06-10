import * as React from 'react';
import clsx from 'clsx';

import styles from './GridList.module.scss';

export type GridListProps = React.HTMLProps<HTMLUListElement>;

export const GridList: React.FC<GridListProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <ul className={clsx(styles.root, className)} {...props}>
            {children}
        </ul>
    );
};

export const GridListItem: React.FC<React.HTMLProps<HTMLLIElement>> = ({
    children,
    ...props
}) => {
    return <li {...props}>{children}</li>;
};
