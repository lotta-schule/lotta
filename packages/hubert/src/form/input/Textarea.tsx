'use client';

import * as React from 'react';

export type TextareaProps = React.HTMLProps<HTMLTextAreaElement> & {
  maxHeight?: React.CSSProperties['maxHeight'];
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ maxHeight, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(
      null
    ) as React.MutableRefObject<HTMLTextAreaElement>;
    const [textareaHeight, setTextareaHeight] = React.useState('auto');
    const [parentHeight, setParentHeight] = React.useState('auto');

    React.useLayoutEffect(() => {
      if (props.value === '') {
        setTextareaHeight('auto');
        setParentHeight('auto');
        return;
      }

      const height = `min(${textareaRef.current?.scrollHeight ?? 0}px, ${
        typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight ?? '100vh'
      })`;
      setParentHeight(height);
      setTextareaHeight(`calc(calc(0.5 * var(--lotta-spacing)) + ${height})`);
    }, [props.value, maxHeight]);

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextareaHeight('auto');
      setParentHeight(`${textareaRef.current?.scrollHeight ?? 0}px`);
      props.onChange?.(e);
    };

    return (
      <div style={{ minHeight: parentHeight }}>
        <textarea
          {...props}
          ref={(instance) => {
            if (!instance) return;
            textareaRef.current = instance;
            if (typeof ref === 'function') {
              ref(instance);
            } else if (ref) {
              ref.current = instance;
            }
          }}
          rows={props.rows || 1}
          style={{ height: textareaHeight }}
          onChange={onChange}
        ></textarea>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
