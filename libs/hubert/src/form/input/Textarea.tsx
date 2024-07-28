'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';

export type TextareaProps = React.HTMLProps<HTMLTextAreaElement> & {
  maxHeight?: React.CSSProperties['maxHeight'];
};

export const Textarea = ({ maxHeight, ref, ...props }: TextareaProps) => {
  const [elem, setElem] = React.useState<HTMLTextAreaElement | null>(null);

  const [textareaHeight, setTextareaHeight] = React.useState('auto');
  const [parentHeight, setParentHeight] = React.useState('auto');

  const setInputHeight = (elem: HTMLTextAreaElement) => {
    const height = `min(${elem.scrollHeight}px, ${
      typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight ?? '100vh'
    })`;
    setParentHeight(height);
    setTextareaHeight(`calc(calc(0.5 * var(--lotta-spacing)) + ${height})`);
  };

  React.useEffect(() => {
    if (props.value === '' || !elem) {
      setTextareaHeight('auto');
      setParentHeight('auto');
      return;
    }

    setInputHeight(elem);
  }, [props.value, maxHeight, elem]);

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (props.onChange) {
        // controlled component, resize only after value has been set
        setTextareaHeight('auto');
        if (elem) {
          setParentHeight(`${elem.scrollHeight}px`);
        }
        props.onChange(e);
      } else if (elem) {
        // not controlled. Value should have been changed by now, just set the elem height
        flushSync(() => {
          setTextareaHeight('auto');
          setParentHeight(`${elem.scrollHeight}px`);
        });
        setInputHeight(elem);
      }
    },
    [elem, props.onChange]
  );

  return (
    <div style={{ minHeight: parentHeight }}>
      <textarea
        {...props}
        ref={(node) => {
          if (ref) {
            if ('current' in ref) {
              ref.current = node;
            } else {
              ref(node);
            }
          }
          setElem(node);

          return () => {
            if (ref) {
              if ('current' in ref) {
                ref.current = null;
              } else {
                ref(null);
              }
            }
            setElem(null);
          };
        }}
        rows={props.rows || 1}
        style={{ height: textareaHeight }}
        onChange={onChange}
      ></textarea>
    </div>
  );
};
Textarea.displayName = 'Textarea';
