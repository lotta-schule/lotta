import * as React from 'react';
import clsx from 'clsx';

import styles from './Overlay.module.scss';

export type OverlayProps = React.HTMLProps<HTMLDivElement>;

export const Overlay = ({ className, ...props }: OverlayProps) => {
  return <div className={clsx(className, styles.root)} {...props}></div>;
};
