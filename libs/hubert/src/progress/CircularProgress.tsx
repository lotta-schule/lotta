'use client';

import * as React from 'react';
import { AriaProgressBarProps } from '@react-types/progress';
import { useProgressBar } from 'react-aria';
import clsx from 'clsx';

import styles from './CircularProgress.module.scss';

export interface CircularProgressProps extends AriaProgressBarProps {
  value?: number;
  size?: React.CSSProperties['width'];
  color?: React.CSSProperties['fill'];
  showValue?: boolean;
  isIndeterminate?: boolean;
  style?: React.CSSProperties;
  className?: React.HTMLProps<HTMLProgressElement>['className'];
}

export const CircularProgress = React.memo(
  ({
    className,
    color,
    showValue,
    isIndeterminate,
    size = '5em',
    ...props
  }: CircularProgressProps) => {
    const { value } = props;
    const { progressBarProps } = useProgressBar({ ...props, isIndeterminate });
    const style: React.CSSProperties = {
      ...(value !== undefined && { '--value': value / 100 }),
      ...(color !== undefined && {
        '--lotta-circular-progress-color': color,
      }),
      width: size,
      height: size,
      ...props.style,
    };

    return (
      <div
        className={clsx(className, styles.root, {
          [styles.indeterminate]: isIndeterminate,
        })}
        style={style}
        {...props}
        {...progressBarProps}
      >
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" pathLength={288.5} />
          {!isIndeterminate && showValue && (
            <text x="50" y="59" fontSize="28">
              {Math.floor(value ?? 0)}%
            </text>
          )}
        </svg>
      </div>
    );
  }
);
CircularProgress.displayName = 'CircularProgress';
