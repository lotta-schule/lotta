'use client';

import * as React from 'react';
import { ToggleProps } from '@react-types/checkbox';
import { AriaCheckboxProps, useCheckbox } from 'react-aria';
import { useToggleState } from 'react-stately';
import clsx from 'clsx';

import styles from './Checkbox.module.scss';

export type CheckboxProps = {
  featureColor?: [red: number, green: number, blue: number];

  className?: string;
  style?: React.CSSProperties;

  children?: React.ReactNode;
} & ToggleProps &
  AriaCheckboxProps;

export const Checkbox = React.forwardRef<HTMLLabelElement, CheckboxProps>(
  ({ style, className, featureColor, ...props }, ref) => {
    const customStyle =
      featureColor &&
      ({
        '--control-indicator-color': featureColor.join(', '),
      } as React.CSSProperties);

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const state = useToggleState(props);
    const { labelProps, inputProps } = useCheckbox(props, state, inputRef);
    const defaultId = React.useId();

    return (
      <label
        {...labelProps}
        style={{ ...style, ...customStyle }}
        className={clsx(className, styles.root, 'HubertCheckbox')}
        ref={ref}
        id={props.id || defaultId}
      >
        <input type="checkbox" ref={inputRef} {...inputProps} />
        {props.children}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
