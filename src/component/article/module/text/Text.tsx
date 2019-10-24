import React, { FunctionComponent, memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent, Typography, makeStyles } from '@material-ui/core';
import { Edit } from './Edit';
import { Show } from './Show';

export interface TextProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

const useStyles = makeStyles(theme => ({
    root: {
        '& a': {
            textDecoration: 'none',
            color: theme.palette.secondary.main
        }
    }
}));

export const Text: FunctionComponent<TextProps> = memo(({ isEditModeEnabled, contentModule, onUpdateModule }) => {
    const styles = useStyles();
    return (
        <CardContent className={styles.root}>
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
    );
});