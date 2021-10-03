import * as React from 'react';
import { CircularProgress } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { FileModel, DirectoryModel } from 'model';
import { Input } from 'component/general/form/input/Input';
import fileExplorerContext from './context/FileExplorerContext';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import clsx from 'clsx';

import styles from './FileTableFooter.module.scss';

export const FileTableFooter = React.memo(() => {
    const { t } = useTranslation();
    const [state, dispatch] = React.useContext(fileExplorerContext);

    const {
        data,
        error,
        loading: isLoading,
    } = useQuery<{
        files: FileModel[];
        directories: DirectoryModel[];
    }>(GetDirectoriesAndFilesQuery, {
        variables: {
            parentDirectoryId:
                state.currentPath[state.currentPath.length - 1].id ?? null,
        },
        skip: state.currentPath.length < 2,
    });

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
        <section className={clsx(styles.root, { [styles.isError]: !!error })}>
            <div className={styles.mainContent}>{mainContent}</div>
            <div>
                <Input
                    type={'search'}
                    placeholder={'im Ordner suchen'}
                    value={state.searchtext}
                    onChange={({ currentTarget }) =>
                        dispatch({
                            type: 'setSearchFilter',
                            searchtext: currentTarget.value,
                        })
                    }
                />
            </div>
        </section>
    );
});
FileTableFooter.displayName = 'FileTableFooter';
