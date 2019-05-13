import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../model';
import { Text } from './text/Text';

interface ContentModuleProps {
    module: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule?(module: ContentModuleModel): void;
}

export const ContentModule: FunctionComponent<ContentModuleProps> = memo(({ isEditModeEnabled, module, onUpdateModule }) => {
    switch (module.type) {
        default: return <Text module={module} isEditModeEnabled={isEditModeEnabled} onUpdateModule={onUpdateModule} />
    }
});