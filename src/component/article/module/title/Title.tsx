import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent, makeStyles } from '@material-ui/core';
import { Edit } from './Edit';
import { Show } from './Show';

export interface TitleProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

const useStyles = makeStyles(theme => ({
    root: {
        paddingTop: 30, 
        paddingBottom: 0,
        margin: '0 16.6%',
        [theme.breakpoints.down('sm')]: {
            margin: 0,
        },
    }
}));

export const Title: FunctionComponent<TitleProps> = memo(({ isEditModeEnabled, contentModule, onUpdateModule }) => {
    const styles = useStyles();
    return (
    <CardContent className={styles.root}>
        {isEditModeEnabled && onUpdateModule && (
            <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
        )}
        {(!isEditModeEnabled || !onUpdateModule) && (
            <Show contentModule={contentModule} />
        )}
    </CardContent>
    );
});