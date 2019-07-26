import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Typography } from '@material-ui/core';
import { get } from 'lodash';

interface ShowProps {
    contentModule: ContentModuleModel;
}

export const Show: FunctionComponent<ShowProps> = memo(({ contentModule }) => {
    const variant = `h${get(contentModule.configuration, 'level', 2)}` as 'h1' | 'h2' | 'h2' | 'h4' | 'h5' | 'h6';

    return (
        <Typography component={variant} variant={variant} gutterBottom>{contentModule.text}</Typography>
    );
});