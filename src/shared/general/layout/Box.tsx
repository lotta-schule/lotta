import * as React from 'react';
import clsx from 'clsx';

import styles from './Box.module.scss';

export type BoxProps = React.HTMLProps<HTMLDivElement>;

export const Box: React.FC<BoxProps> = ({ children, className, ...props }) => {
    return (
        <div className={clsx(styles.box, className)} {...props}>
            {children}
        </div>
    );
};
