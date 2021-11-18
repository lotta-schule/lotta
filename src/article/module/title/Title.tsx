import * as React from 'react';
import { CardContent } from '@material-ui/core';
import { ContentModuleModel } from 'model';
import { Edit } from './Edit';
import { Show } from './Show';

import styles from './Title.module.scss';

export interface TitleProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Title = React.memo<TitleProps>(
    ({ isEditModeEnabled, contentModule, onUpdateModule }) => {
        return (
            <CardContent
                className={styles.root}
                data-testid="TitleContentModule"
            >
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
        );
    }
);
Title.displayName = 'Title';
