import * as React from 'react';
import clsx from 'clsx';

import styles from './Divider.module.scss';

export type DividerProps = React.HTMLProps<HTMLHRElement>;

export const Divider = React.memo<DividerProps>(({ className, ...props }) => {
    return <hr className={clsx(styles.divider, className)} {...props} />;
});
Divider.displayName = 'Divider';
