import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Card, CardContent, Typography } from '@material-ui/core';
import { Edit } from './Edit';
import { Show } from './Show';

export interface TextProps {
    module: ContentModuleModel;
    onUpdateModule?(module: ContentModuleModel): void;
    isEditModeEnabled?: boolean;
}

export const Text: FunctionComponent<TextProps> = memo(({ isEditModeEnabled, module, onUpdateModule }) => (
    <Card component={'section'}>
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
    </Card>
));