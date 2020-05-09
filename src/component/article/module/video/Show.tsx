import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Typography } from '@material-ui/core';
import { VideoVideo } from './VideoVideo';

interface ShowProps {
    contentModule: ContentModuleModel<{ captions: string[] }>;
}

export const Show: FunctionComponent<ShowProps> = memo(({ contentModule }) => {
    const captions: string[] = contentModule.content?.captions ?? [];
    return (
        <figure style={{ margin: 0, }}>
            <VideoVideo contentModule={contentModule} />
            <figcaption>
                <Typography variant={'subtitle2'}>{captions[0]}</Typography>
            </figcaption>
        </figure>
    );
});