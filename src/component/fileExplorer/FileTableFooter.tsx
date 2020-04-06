import React, { memo, useContext } from 'react';
import { makeStyles, useTheme, CircularProgress, Typography } from '@material-ui/core';
import { useQuery } from '@apollo/react-hooks';
import { FileModel, DirectoryModel } from 'model';
import { GetDirectoriesAndFilesQuery } from 'api/query/GetDirectoriesAndFiles';
import fileExplorerContext from './context/FileExplorerContext';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        borderTop: `1px solid ${theme.palette.secondary.main}`,
        paddingTop: theme.spacing(.5),
        paddingBottom: theme.spacing(.5),
        textAlign: 'center'
    }
}));

export const FileTableFooter = memo(() => {
    const styles = useStyles();
    const theme = useTheme();
    const [state] = useContext(fileExplorerContext);

    const { data, error, loading: isLoading } = useQuery<{ files: FileModel[], directories: DirectoryModel[]; }>(GetDirectoriesAndFilesQuery, {
        variables: {
            parentDirectoryId: state.currentPath[state.currentPath.length - 1].id ?? null
        },
        skip: state.currentPath.length < 2
    });

    const content = (() => {
        if (state.currentPath.length < 2) {
            return (
                <span>&nbsp;</span>
            );
        }
        if (error) {
            return (
                <span>{error.message}</span>
            );
        }
        if (isLoading) {
            return (
                <span><CircularProgress size={'1rem'} /> &nbsp; Dateien werden geladen ...</span>
            );
        }
        if (state.markedFiles.length) {
            return (
                <span>{state.markedFiles.length} von {data?.files.length} Dateien ausgewählt</span>
            );
        }
        return (
            <span>{data?.files.length} Dateien im Ordner</span>
        )
    })();

    return (
        <Typography component={'div'} variant={'body2'} className={styles.root} style={{ borderColor: theme.palette.error.main }}>
            {content}
        </Typography>
    );
});