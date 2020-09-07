import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent } from '@material-ui/core';
import { Edit } from './Edit';
import { Show } from './Show';

export interface VideoProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Video: FunctionComponent<VideoProps> = memo(({ isEditModeEnabled, contentModule, onUpdateModule }) => (
    <CardContent style={{ padding: 0, }} data-testid="VideoContentModule">
        {isEditModeEnabled && onUpdateModule ?
            (
                <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
            ) : (
                <Show contentModule={contentModule} />
            )
        }
    </CardContent>
));
