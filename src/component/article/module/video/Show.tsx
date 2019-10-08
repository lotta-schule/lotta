import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Typography } from '@material-ui/core';
import { VideoVideo } from './VideoVideo';

interface ShowProps {
    contentModule: ContentModuleModel;
}

export const Show: FunctionComponent<ShowProps> = memo(({ contentModule }) => {
    let captions: string[];
    try {
        captions = JSON.parse(contentModule.text || '[]');
    } catch (e) {
        captions = [];
    }
    return (
        <figure>
            <VideoVideo contentModule={contentModule} />
            <figcaption>
                <Typography variant={'subtitle2'}>{captions[0]}</Typography>
            </figcaption>
        </figure>
    );
});