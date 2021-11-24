import * as React from 'react';

export type TextareaProps = React.HTMLProps<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (props, ref) => {
        const textareaRef = React.useRef<HTMLTextAreaElement>(
            null
        ) as React.MutableRefObject<HTMLTextAreaElement>;
        const [text, setText] = React.useState('');
        const [textareaHeight, setTextareaHeight] = React.useState('auto');
        const [parentHeight, setParentHeight] = React.useState('auto');

        React.useEffect(() => {
            setParentHeight(`${textareaRef.current!.scrollHeight}px`);
            setTextareaHeight(
                `calc(calc(0.5 * var(--lotta-spacing)) + ${
                    textareaRef.current!.scrollHeight
                }px)`
            );
        }, [text]);

        const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setTextareaHeight('auto');
            setParentHeight(`${textareaRef.current!.scrollHeight}px`);
            setText(e.currentTarget.value);
            props.onChange?.(e);
        };

        return (
            <div style={{ minHeight: parentHeight }}>
                <textarea
                    {...props}
                    ref={(instance) => {
                        textareaRef.current = instance!;
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
