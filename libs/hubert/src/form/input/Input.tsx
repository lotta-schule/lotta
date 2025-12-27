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

export const Input = ({
  className,
  inline,
  multiline,
  children,
  ...props
}: InputProps) => {
  const component = multiline === true ? Textarea : 'input';
  return React.createElement(
    component,
    {
      ...props,
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
