'use client';

import * as React from 'react';
import { Textarea, TextareaProps } from './Textarea';
import clsx from 'clsx';

import styles from './Input.module.scss';

export interface SingleLineInputProps extends React.HTMLProps<HTMLInputElement> {
  inline?: boolean;
  multiline?: false;
}

export interface MultiLineInputProps extends TextareaProps {
  inline?: boolean;
  multiline: true;
}

export type InputProps = SingleLineInputProps | MultiLineInputProps;

const setRef = <T,>(
  ref: React.Ref<T> | string | undefined,
  value: T | null
) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref && typeof ref === 'object') {
    (ref as React.RefObject<T | null>).current = value;
  }
};

/**
 * Text typed into a server-rendered field before the page is hydrated is not
 * known to React, and would be reset on the next render. When the field is
 * mounted with a different value than the controlled one, report the typed
 * text through `onChange`, as if it had been typed after hydration.
 */
// Other types (date, time, color, number, …) normalize their DOM value, so it
// can differ from the controlled value without the user having typed anything.
const FREE_TEXT_TYPES = ['text', 'search', 'email', 'url', 'tel', 'password'];

const useAdoptValueTypedBeforeHydration = (
  elementRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
  value: InputProps['value'],
  onChange: InputProps['onChange']
) => {
  const latest = React.useRef({ value, onChange });
  latest.current = { value, onChange };

  // only on mount: that's when a value typed before hydration can differ
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    const { value, onChange } = latest.current;
    if (
      element &&
      (element instanceof HTMLTextAreaElement ||
        FREE_TEXT_TYPES.includes(element.type)) &&
      value !== undefined &&
      onChange &&
      element.value !== '' &&
      element.value !== String(value ?? '')
    ) {
      onChange({
        target: element,
        currentTarget: element,
      } as unknown as React.ChangeEvent<any>);
    }
  }, [elementRef]);
};

export const Input = ({
  className,
  inline,
  multiline,
  children,
  ref,
  ...props
}: InputProps) => {
  const elementRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const mergedRef = React.useCallback(
    (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      elementRef.current = node;
      setRef(ref as React.Ref<typeof node>, node);
    },
    [ref]
  );

  useAdoptValueTypedBeforeHydration(elementRef, props.value, props.onChange);

  const component = multiline === true ? Textarea : 'input';
  return React.createElement(
    component,
    {
      ...props,
      ref: mergedRef,
      className: clsx(
        clsx(className, styles.root, {
          [styles.inline]: inline,
        })
      ),
    } as any,
    children
  );
};
Input.displayName = 'Input';
