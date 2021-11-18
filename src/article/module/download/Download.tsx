import * as React from 'react';
import { ContentModuleModel } from 'model';
import { CardContent } from '@material-ui/core';
import { Show } from './Show';
import { Edit } from './Edit';

export interface DownloadProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Download = React.memo<DownloadProps>(
    ({ isEditModeEnabled, contentModule, onUpdateModule }) => (
        <CardContent data-testid="DownloadContentModule">
            {isEditModeEnabled && onUpdateModule && (
                <Edit
                    contentModule={contentModule}
                    onUpdateModule={onUpdateModule}
                />
            )}
            {(!isEditModeEnabled || !onUpdateModule) && (
                <Show contentModule={contentModule} />
            )}
        </CardContent>
    )
);
Download.displayName = 'Download';
