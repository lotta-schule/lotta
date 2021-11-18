import * as React from 'react';
import { Textarea, TextareaProps } from './Textarea';
import clsx from 'clsx';

import styles from './Input.module.scss';

export type InputProps =
    | {
          /**
           * When set, the input field does not style as input field
           */
          inline?: boolean;

          /**
           * When set, the input does use a textarea and allows entering multiple lines
           */
          multiline?: boolean;
      } & (
          | ({ multiline?: false } & React.HTMLProps<HTMLInputElement>)
          | ({ multiline: true } & TextareaProps)
      );

export const Input = React.forwardRef<any, InputProps>(
    ({ className, inline, multiline, children, ...props }, ref) => {
        const component = multiline === true ? Textarea : 'input';
        return React.createElement(
            component,
            {
                ...props,
                ref,
                className: clsx(
                    clsx(className, styles.root, {
                        [styles.inline]: inline,
                    })
                ),
            } as any,
            children
        );
    }
);
Input.displayName = 'Input';
