import React, { memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Typography } from '@material-ui/core';
import get from 'lodash/get';

interface ShowProps {
    contentModule: ContentModuleModel<{ title: string }>;
}

export const Show = memo<ShowProps>(({ contentModule }) => {
    const variant = `h${get(contentModule.configuration, 'level', 4)}` as
        | 'h4'
        | 'h5'
        | 'h6';

    return (
        <Typography component={variant} variant={variant}>
            {contentModule.content?.title}
        </Typography>
    );
});
