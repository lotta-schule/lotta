'use client';

import * as React from 'react';
import { AriaProgressBarProps } from '@react-types/progress';
import { useProgressBar } from 'react-aria';
import clsx from 'clsx';

import styles from './LinearProgress.module.scss';

export interface LinearProgressProps extends AriaProgressBarProps {
  value?: number;
  isIndeterminate?: boolean;
  className?: React.HTMLProps<HTMLProgressElement>['className'];
}

export const LinearProgress = React.memo<LinearProgressProps>(
  ({ className, ...props }) => {
    const { value, isIndeterminate } = props;
    const { progressBarProps } = useProgressBar(props);
    const indicatorStyle: React.CSSProperties = {
      ...(value !== undefined && { width: `${Math.floor(value)}%` }),
    };
    return (
      <div
        className={clsx(className, styles.root, {
          [styles.indeterminate]: isIndeterminate,
        })}
      >
        <div {...progressBarProps} className={styles.progressBar}>
          <div className={styles.indicator} style={indicatorStyle}></div>
        </div>
      </div>
    );
  }
);
LinearProgress.displayName = 'LinearProgress';
