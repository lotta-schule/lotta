import * as React from 'react';
import { ContentModuleModel } from 'model';
import { Show } from './Show';
import { Edit } from './Edit';

export interface DownloadProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Download = React.memo<DownloadProps>(
    ({ isEditModeEnabled, contentModule, onUpdateModule }) => (
        <div data-testid="DownloadContentModule">
            {isEditModeEnabled && onUpdateModule && (
                <Edit
                    contentModule={contentModule}
                    onUpdateModule={onUpdateModule}
                />
            )}
            {(!isEditModeEnabled || !onUpdateModule) && (
                <Show contentModule={contentModule} />
            )}
        </div>
    )
);
Download.displayName = 'Download';
