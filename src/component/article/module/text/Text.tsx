import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent, Typography } from '@material-ui/core';
import { Edit } from './Edit';
import { Show } from './Show';

export interface TextProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Text: FunctionComponent<TextProps> = memo(({ isEditModeEnabled, contentModule, onUpdateModule }) => (
    <CardContent>
        <Typography variant={'body1'}>
            {isEditModeEnabled && onUpdateModule ?
                (
                    <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
                ) : (
                    <Show contentModule={contentModule} />
                )
            }
        </Typography>
    </CardContent>
));