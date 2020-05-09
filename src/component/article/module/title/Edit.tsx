import React, { FunctionComponent, memo, FormEvent } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Typography } from '@material-ui/core';
import get from 'lodash/get';

interface EditProps {
    contentModule: ContentModuleModel<{ title: string }>;
    onUpdateModule(contentModule: ContentModuleModel<{ title: string }>): void;
}

export const Edit: FunctionComponent<EditProps> = memo(({ contentModule, onUpdateModule }) => {

    const variant = `h${get(contentModule.configuration, 'level', 4)}` as 'h4' | 'h5' | 'h6';

    return (
        <Typography
            contentEditable={true}
            component={'input'}
            variant={variant}
            gutterBottom
            defaultValue={contentModule.content?.title}
            style={{ width: '100%', outline: 'none', border: 0 }}
            onChange={(e: FormEvent<HTMLInputElement>) => {
                onUpdateModule({
                    ...contentModule,
                    content: { title: (e.target as HTMLInputElement).value }
                });
            }}
        />
    );
});