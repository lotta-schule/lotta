import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent } from '@material-ui/core';
import { Edit } from './Edit';
import { Show } from './Show';

export interface TitleProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Title: FunctionComponent<TitleProps> = memo(({ isEditModeEnabled, contentModule, onUpdateModule }) => (
    <CardContent style={{ paddingTop: 30, paddingBottom: 0, maxWidth: '55em', margin: '0 auto', }}>
        {isEditModeEnabled && onUpdateModule && (
            <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
        )}
        {(!isEditModeEnabled || !onUpdateModule) && (
            <Show contentModule={contentModule} />
        )}
    </CardContent>
));