import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent, Typography } from '@material-ui/core';
import { Edit } from './Edit';
import { Show } from './Show';
import { Config } from './Config';

export interface TitleProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    showConfig?: boolean;
    onUpdateModule?(contentModule: ContentModuleModel): void;
}

export const Title: FunctionComponent<TitleProps> = memo(({ isEditModeEnabled, contentModule, showConfig, onUpdateModule }) => (
    <CardContent>
        <Typography variant={'body1'}>
            {isEditModeEnabled && onUpdateModule && showConfig && (
                <Config contentModule={contentModule} onUpdateModule={onUpdateModule} />
            )}
            {isEditModeEnabled && onUpdateModule && !showConfig && (
                <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
            )}
            {(!isEditModeEnabled || !onUpdateModule) && (
                <Show contentModule={contentModule} />
            )}
        </Typography>
    </CardContent>
));