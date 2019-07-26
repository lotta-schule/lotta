import React, { FunctionComponent, memo, FormEvent } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Typography } from '@material-ui/core';
import { get } from 'lodash';

interface EditProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Edit: FunctionComponent<EditProps> = memo(({ contentModule, onUpdateModule }) => {

    const variant = `h${get(contentModule.configuration, 'level', 2)}` as 'h1' | 'h2' | 'h2' | 'h4' | 'h5' | 'h6';

    return (
        <Typography
            contentEditable={true}
            component={'input'}
            variant={variant}
            gutterBottom
            defaultValue={contentModule.text}
            style={{ width: '100%', outline: 'none', border: 0 }}
            onChange={(e: FormEvent<HTMLInputElement>) => {
                onUpdateModule({
                    ...contentModule,
                    text: (e.target as HTMLInputElement).value
                });
            }}
        />
    );
});