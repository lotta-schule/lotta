import React, { memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent, makeStyles } from '@material-ui/core';
import { Edit } from './Edit';
import { Show } from './Show';

export interface TextProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

const useStyles = makeStyles(theme => ({
    root: {
        margin: '0 16.6%',
        [theme.breakpoints.down('sm')]: {
            margin: 0,
        },
        '& a': {
            textDecoration: 'none',
            color: theme.palette.secondary.main
        },
        '& p, & ul, & ol': {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
        '& ul, & ol': {
            ...theme.typography.body1
        }
    }
}));

export const Text = memo<TextProps>(({ isEditModeEnabled, contentModule, onUpdateModule }) => {
    const styles = useStyles();
    return (
        <CardContent className={styles.root}>
            {isEditModeEnabled && onUpdateModule ?
                (
                    <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
                ) : (
                    <Show contentModule={contentModule} />
                )
            }
        </CardContent>
    );
});