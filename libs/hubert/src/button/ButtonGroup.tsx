'use client';

import * as React from 'react';
import { ButtonGroupContextProvider } from './ButtonGroupContext';
import clsx from 'clsx';

import styles from './ButtonGroup.module.scss';

export interface ButtonGroupProps {
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode | React.ReactNode[];
}

export const ButtonGroupHelperClasses = {
  isFirstButton: styles.isFirstButton,
  isLastButton: styles.isLastButton,
};

export const ButtonGroup = ({
  fullWidth,
  className,
  style,
  children,
}: ButtonGroupProps) => {
  return (
    <ButtonGroupContextProvider>
      <div
        role={'group'}
        style={style}
        className={clsx(styles.root, className, { fullWidth })}
      >
        {children}
      </div>
    </ButtonGroupContextProvider>
  );
};
