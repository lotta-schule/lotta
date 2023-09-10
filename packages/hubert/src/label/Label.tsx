'use client';

import * as React from 'react';
import { useLabel } from '@react-aria/label';
import clsx from 'clsx';

import styles from './Label.module.scss';

export type LabelProps = {
  label: React.ReactNode;
} & React.HTMLProps<HTMLDivElement>;

export const Label = React.forwardRef(
  (
    { children, className, label, ...props }: LabelProps,
    forwardedRef: React.Ref<HTMLDivElement | null>
  ) => {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(forwardedRef, () => ref.current);

    const { labelProps, fieldProps } = useLabel({
      label,
      labelElementType: 'span',
      ...props,
    });

    return (
      <div {...props} ref={ref} className={clsx(className, styles.root)}>
        <span className={styles.label} {...labelProps}>
          {label}
        </span>
        {React.cloneElement(children as React.ReactElement, fieldProps)}
      </div>
    );
  }
);
Label.displayName = 'Label';
