import React, { memo, useContext } from 'react';
import {
    makeStyles,
    CircularProgress,
    Typography,
    Theme,
    TextField,
} from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { FileModel, DirectoryModel } from 'model';
import { GetDirectoriesAndFilesQuery } from 'api/query/GetDirectoriesAndFiles';
import fileExplorerContext from './context/FileExplorerContext';

const useStyles = makeStyles<Theme, { error: boolean }>((theme) => ({
    root: {
        width: '100%',
        borderTop: ({ error }) =>
            `1px solid ${
                error ? theme.palette.error.main : theme.palette.secondary.main
            }`,
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        display: 'flex',
        justifyContent: 'space-between',
    },
}));

export const FileTableFooter = memo(() => {
    const { t } = useTranslation();
    const [state, dispatch] = useContext(fileExplorerContext);

    const { data, error, loading: isLoading } = useQuery<{
        files: FileModel[];
        directories: DirectoryModel[];
    }>(GetDirectoriesAndFilesQuery, {
        variables: {
            parentDirectoryId:
                state.currentPath[state.currentPath.length - 1].id ?? null,
        },
        skip: state.currentPath.length < 2,
    });
    const styles = useStyles({ error: !!error });

    const mainContent = (() => {
        if (state.currentPath.length < 2) {
            return <span>&nbsp;</span>;
        }
        if (error) {
            return <span>{error.message}</span>;
        }
        if (isLoading) {
            return (
                <span>
                    <CircularProgress size={'1rem'} /> &nbsp; Dateien werden
                    geladen ...
                </span>
            );
        }
        if (state.markedFiles.length) {
            return (
                <span>
                    {t('files.explorer.markedFiles', {
                        count: state.markedFiles.length,
                        total: data?.files.length,
                    })}
                </span>
            );
        }
        return (
            <span>
                {t('files.explorer.totalFiles', { count: data?.files.length })}
            </span>
        );
    })();

    return (
        <section className={styles.root}>
            <Typography component={'div'} variant={'body2'}>
                {mainContent}
            </Typography>
            <div>
                <TextField
                    type={'search'}
                    placeholder={'im Ordner suchen'}
                    value={state.searchtext}
                    onChange={(e) =>
                        dispatch({
                            type: 'setSearchFilter',
                            searchtext: e.currentTarget.value,
                        })
                    }
                />
            </div>
        </section>
    );
});
