import React, { memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent, makeStyles } from '@material-ui/core';
import { Edit } from './Edit';
import { Show } from './Show';

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

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: 30,
        paddingBottom: 0,
        margin: '0 16.6%',
        overflow: 'auto',
        [theme.breakpoints.down('sm')]: {
            margin: 0,
        },
    },
}));

export const Table = memo<TableProps>(
    ({ isEditModeEnabled, contentModule, onUpdateModule }) => {
        const styles = useStyles();
        return (
            <CardContent
                className={styles.root}
                data-testid="TableContentModule"
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
