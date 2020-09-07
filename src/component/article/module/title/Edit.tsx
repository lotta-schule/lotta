import React, { memo, useEffect, useRef, useState, KeyboardEvent, FocusEvent, FormEvent } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Typography } from '@material-ui/core';
import get from 'lodash/get';

interface EditProps {
    contentModule: ContentModuleModel<{ title: string }>;
    onUpdateModule(contentModule: ContentModuleModel<{ title: string }>): void;
}

export const Edit = memo<EditProps>(({ contentModule, onUpdateModule }) => {
    const requestBlurRef = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState(contentModule.content?.title ?? '');

    useEffect(() => {
        if (contentModule.content?.title) {
            setTitle(contentModule.content.title);
        }
    }, [contentModule.content]);

    useEffect(() => {
        if (requestBlurRef.current) {
            inputRef.current!.blur();
            requestBlurRef.current = false;
        }
    }, [title]);

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 27) { // ESC
            requestBlurRef.current = true;
            setTitle(contentModule.content?.title ?? ''); // reset to initial value
        }
    };

    const variant = `h${get(contentModule.configuration, 'level', 4)}` as 'h4' | 'h5' | 'h6';

    return (
        <Typography
            component={'input'}
            variant={variant}
            gutterBottom
            ref={inputRef}
            value={title}
            onKeyDown={onKeyDown}
            onChange={(e: FormEvent<HTMLInputElement>) => setTitle(e.currentTarget.value)}
            style={{ width: '100%', outline: 'none', border: 0 }}
            onBlur={(e: FocusEvent<HTMLInputElement>) => {
                onUpdateModule({
                    ...contentModule,
                    content: { title }
                });
            }}
        />
    );
});
