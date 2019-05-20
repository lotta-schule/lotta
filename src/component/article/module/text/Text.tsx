import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent, Typography } from '@material-ui/core';
import { Edit } from './Edit';
import { Show } from './Show';

export interface TextProps {
    module: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule?(module: ContentModuleModel): void;
}

export const Text: FunctionComponent<TextProps> = memo(({ isEditModeEnabled, module, onUpdateModule }) => (
    <CardContent>
        <Typography variant={'body1'}>
            {isEditModeEnabled && onUpdateModule ?
                (
                    <Edit module={module} onUpdateModule={onUpdateModule} />
                ) : (
                    <Show module={module} />
                )
            }
        </Typography>
    </CardContent>
));