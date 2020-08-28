import React, { memo, lazy } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent } from '@material-ui/core';
import { Show } from './Show';

const Edit = lazy(() => import('./Edit'));

export interface AudioProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Audio = memo<AudioProps>(({ isEditModeEnabled, contentModule, onUpdateModule }) => (
    <CardContent data-testid="AudioContentModule">
        {isEditModeEnabled && onUpdateModule ?
            (
                <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
            ) : (
                <Show contentModule={contentModule} />
            )
        }
    </CardContent>
));
