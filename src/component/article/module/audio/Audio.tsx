import * as React from 'react';
import { ContentModuleModel } from 'model';
import { CardContent } from '@material-ui/core';
import { Show } from './Show';
import { Edit } from './Edit';

export interface AudioProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Audio = React.memo<AudioProps>(
    ({ isEditModeEnabled, contentModule, onUpdateModule }) => (
        <CardContent data-testid="AudioContentModule">
            {isEditModeEnabled && onUpdateModule ? (
                <Edit
                    contentModule={contentModule}
                    onUpdateModule={onUpdateModule}
                />
            ) : (
                <Show contentModule={contentModule} />
            )}
        </CardContent>
    )
);
Audio.displayName = 'Audio';
