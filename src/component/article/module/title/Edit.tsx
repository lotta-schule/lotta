import * as React from 'react';
import { ContentModuleModel } from 'model';
import get from 'lodash/get';
import clsx from 'clsx';

import styles from './Title.module.scss';

interface EditProps {
    contentModule: ContentModuleModel<{ title: string }>;
    onUpdateModule(contentModule: ContentModuleModel<{ title: string }>): void;
}

export const Edit = React.memo<EditProps>(
    ({ contentModule, onUpdateModule }) => {
        const requestBlurRef = React.useRef(false);
        const inputRef = React.useRef<HTMLInputElement>(null);
        const [title, setTitle] = React.useState(
            contentModule.content?.title ?? ''
        );

        React.useEffect(() => {
            if (contentModule.content?.title) {
                setTitle(contentModule.content.title);
            }
        }, [contentModule.content]);

        React.useEffect(() => {
            if (requestBlurRef.current) {
                inputRef.current!.blur();
                requestBlurRef.current = false;
            }
        }, [title]);

        const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Escape') {
                requestBlurRef.current = true;
                setTitle(contentModule.content?.title ?? ''); // reset to initial value
            }
        };

        const variant = `h${get(contentModule.configuration, 'level', 4)}` as
            | 'h4'
            | 'h5'
            | 'h6';

        return (
            <input
                ref={inputRef}
                value={title}
                className={clsx(styles.edit, styles[variant])}
                onKeyDown={onKeyDown}
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                    setTitle(e.currentTarget.value)
                }
                onBlur={(_e: React.FocusEvent<HTMLInputElement>) => {
                    onUpdateModule({
                        ...contentModule,
                        content: { title },
                    });
                }}
            />
        );
    }
);
Edit.displayName = 'TitleEdit';
