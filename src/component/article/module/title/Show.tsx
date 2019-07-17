import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Typography } from '@material-ui/core';

interface ShowProps {
    contentModule: ContentModuleModel;
}

export const Show: FunctionComponent<ShowProps> = memo(({ contentModule }) => {

    return (
        <Typography component={'h2'} variant={'h2'} gutterBottom>{contentModule.text}</Typography>
    );
});