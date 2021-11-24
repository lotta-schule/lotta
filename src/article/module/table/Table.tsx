import * as React from 'react';
import { ContentModuleModel } from 'model';
import { Edit } from './Edit';
import { Show } from './Show';

import styles from './Table.module.scss';

export interface TableCell {
    text: string;
}

export interface TableContent {
    rows: TableCell[][];
}

export interface TableConfiguration {}

export interface TableProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule?: (contentModule: ContentModuleModel) => void;
}

export const Table = React.memo<TableProps>(
    ({ isEditModeEnabled, contentModule, onUpdateModule }) => {
        return (
            <div className={styles.root} data-testid="TableContentModule">
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
        );
    }
);
Table.displayName = 'Table';
