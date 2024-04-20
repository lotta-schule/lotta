'use client';

import * as React from 'react';
import { ToggleProps } from '@react-types/checkbox';
import {
  AriaCheckboxProps,
  VisuallyHidden,
  useCheckbox,
  useFocusRing,
} from 'react-aria';
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

export const Checkbox = React.forwardRef(
  (
    { style, className, featureColor, ...props }: CheckboxProps,
    ref: React.RefObject<HTMLLabelElement>
  ) => {
    const customStyle =
      featureColor &&
      ({
        '--control-indicator-color': featureColor.join(', '),
      } as React.CSSProperties);

    const inputRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;
    const state = useToggleState(props);
    const { inputProps } = useCheckbox(props, state, inputRef);
    const { isFocusVisible, focusProps } = useFocusRing();

    return (
      <label
        style={{ ...style, ...customStyle }}
        className={clsx(className, styles.root)}
        ref={ref}
      >
        <VisuallyHidden>
          <input
            {...inputProps}
            {...focusProps}
            ref={inputRef}
            className={clsx(className, styles.input)}
          />
        </VisuallyHidden>
        <div
          className={clsx(styles.controlIndicator, {
            [styles.isSelected]: state.isSelected,
            [styles.isFocusVisible]: isFocusVisible,
            [styles.isDisabled]: props.isDisabled,
          })}
        />
        {props.children}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
