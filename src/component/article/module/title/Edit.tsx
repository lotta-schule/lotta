import React, { FunctionComponent, memo, FormEvent } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Typography } from '@material-ui/core';

interface EditProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Edit: FunctionComponent<EditProps> = memo(({ contentModule, onUpdateModule }) => {

    return (
        <Typography
            contentEditable={true}
            component={'input'}
            variant={'h2'}
            gutterBottom
            defaultValue={contentModule.text}
            onChange={(e: FormEvent<HTMLInputElement>) => {
                onUpdateModule({
                    ...contentModule,
                    text: (e.target as HTMLInputElement).value
                });
            }}
        />
    );
});