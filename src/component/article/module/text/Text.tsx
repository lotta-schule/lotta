import * as React from 'react';
import { ContentModuleModel } from 'model';
import { CardContent } from '@material-ui/core';
import { Edit } from './Edit';
import { Show } from './Show';

import styles from './Text.module.scss';

export interface TextProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Text = React.memo<TextProps>(
    ({ isEditModeEnabled, contentModule, onUpdateModule }) => {
        return (
            <CardContent
                className={styles.root}
                data-testid="TextContentModule"
            >
                {isEditModeEnabled && onUpdateModule ? (
                    <Edit
                        contentModule={contentModule}
                        onUpdateModule={onUpdateModule}
                    />
                ) : (
                    <Show contentModule={contentModule} />
                )}
            </CardContent>
        );
    }
);
Text.displayName = 'Text';
