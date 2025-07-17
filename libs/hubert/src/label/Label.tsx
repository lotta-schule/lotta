'use client';

import * as React from 'react';
import { useLabel } from 'react-aria';
import clsx from 'clsx';

import styles from './Label.module.scss';

export type LabelProps = {
  label: React.ReactNode;
  hide?: boolean;
} & React.HTMLProps<HTMLDivElement>;

export const Label = ({
  children,
  className,
  label,
  hide,
  ...props
}: LabelProps) => {
  const { labelProps, fieldProps } = useLabel({
    label,
    labelElementType: 'span',
    ...props,
  });

  return (
    <div
      {...props}
      className={clsx(className, styles.root, {
        [styles.isHidden]: !!hide,
      })}
    >
      <span className={styles.label} {...labelProps}>
        {label}
      </span>
      {React.cloneElement(children as React.ReactElement, fieldProps)}
    </div>
  );
};
Label.displayName = 'Label';
