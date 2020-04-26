import React, { FunctionComponent, memo, lazy } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent } from '@material-ui/core';
import { Show } from './Show';

const Edit = lazy(() => import('./Edit'));

export interface AudioProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Audio: FunctionComponent<AudioProps> = memo(({ isEditModeEnabled, contentModule, onUpdateModule }) => (
    <CardContent>
        {isEditModeEnabled && onUpdateModule ?
            (
                <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
            ) : (
                <Show contentModule={contentModule} />
            )
        }
    </CardContent>
));