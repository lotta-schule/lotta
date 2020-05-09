import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { AudioAudio } from './AudioAudio';
import { Typography } from '@material-ui/core';

interface ShowProps {
    contentModule: ContentModuleModel<{ captions: string[] }>;
}

export const Show: FunctionComponent<ShowProps> = memo(({ contentModule }) => {
    const captions: string[] = contentModule.content?.captions ?? [];
    return (
        <figure>
            <AudioAudio contentModule={contentModule} />
            <figcaption>
                <Typography variant={'subtitle2'}>{captions[0]}</Typography>
            </figcaption>
        </figure>
    );
});
