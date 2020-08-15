import React, { memo, lazy } from 'react';
import { ContentModuleModel } from '../../../../model';
import { CardContent, makeStyles } from '@material-ui/core';
import { Show } from './Show';

const Edit = lazy(() => import('./Edit'));

export interface DownloadProps {
    contentModule: ContentModuleModel;
    isEditModeEnabled?: boolean;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const useStyles = makeStyles(theme => ({
    downloadItemWrapper: {
        marginBottom: theme.spacing(2),
        marginLeft: '16.6%',
        marginRight: '16,6%',
        [theme.breakpoints.down('sm')]: {
            marginRight: 0,
            marginLeft: 0,
        },
        '&:last-child $downloadItemDivider': {
            display: 'none'
        }
    },
    downloadItemDivider: {
        width: '100%'
    },
    downloadWrapperHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
    },
    downloadDescription: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '66%',
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(13),
        color: theme.palette.text.secondary,
    },
    textArea: {
        width: '100%',
        border: `1px solid ${theme.palette.primary.main}`,
        padding: theme.spacing(1),
        resize: 'inherit',
        color: 'inherit',
        font: 'inherit'
    },
    filename: {
        fontSize: theme.typography.pxToRem(15),
    }
}));
export const Download = memo<DownloadProps>(({ isEditModeEnabled, contentModule, onUpdateModule }) => (
    <CardContent data-testid="DownloadContentModule">
        {isEditModeEnabled && onUpdateModule && (
            <Edit contentModule={contentModule} onUpdateModule={onUpdateModule} />
        )}
        {(!isEditModeEnabled || !onUpdateModule) && (
            <Show contentModule={contentModule} />
        )}
    </CardContent>
));
