import * as React from 'react';
import { Paper, Toolbar } from '@material-ui/core';
import { FileModel } from 'model';
import { useTranslation } from 'react-i18next';
import { ActiveUploadsModal } from './ActiveUploadsModal';
import { FileUsageModal } from './FileUsageModal';
import { CreateNewDirectoryDialog } from './CreateNewDirectoryDialog';
import { DeleteFilesDialog } from './DeleteFilesDialog';
import { FilesView } from './FilesView';
import { FileToolbar } from './FileToolbar';
import { MoveFilesDialog } from './MoveFilesDialog';
import {
    Provider,
    defaultState,
    FileExplorerMode,
} from './context/FileExplorerContext';
import { Action, reducer } from './context/reducer';
import { MoveDirectoryDialog } from './MoveDirectoryDialog';
import { Button } from 'component/general/button/Button';
import clsx from 'clsx';

import styles from './FileExplorer.module.scss';

export interface FileExplorerProps {
    style?: React.CSSProperties;
    className?: string;
    multiple?: boolean;
    fileFilter?(file: FileModel): boolean;
    onSelect?(file: FileModel[] | FileModel): void;
}

export const FileExplorer = React.memo<FileExplorerProps>(
    ({ style, className, multiple, fileFilter, onSelect }) => {
        const { t } = useTranslation();

        const [state, dispatch] = React.useReducer<
            React.Reducer<typeof defaultState, Action>
        >(reducer, {
            ...defaultState,
            mode: onSelect
                ? multiple
                    ? FileExplorerMode.SelectMultiple
                    : FileExplorerMode.Select
                : FileExplorerMode.ViewAndEdit,
        });

        return (
            <Provider value={[state, dispatch]}>
                <Paper style={style} className={clsx(styles.root, className)}>
                    <ActiveUploadsModal />
                    <FileUsageModal />
                    <CreateNewDirectoryDialog
                        open={state.showCreateNewFolder}
                        basePath={state.currentPath}
                        onRequestClose={() =>
                            dispatch({ type: 'hideCreateNewFolder' })
                        }
                    />
                    {state.markedFiles.length > 0 && <MoveFilesDialog />}
                    <MoveDirectoryDialog />
                    <DeleteFilesDialog />

                    <FileToolbar />
                    <FilesView />
                    {state.mode !== FileExplorerMode.ViewAndEdit && (
                        <Toolbar className={styles.bottomToolbar}>
                            <Button
                                disabled={state.selectedFiles.length < 1}
                                onClick={() => {
                                    onSelect?.(
                                        state.mode === FileExplorerMode.Select
                                            ? state.selectedFiles[0]
                                            : state.selectedFiles
                                    );
                                    dispatch({ type: 'resetSelectedFiles' });
                                    dispatch({ type: 'hideActiveUploads' });
                                }}
                            >
                                {t('files.explorer.selectFiles', {
                                    count: state.selectedFiles.length,
                                })}
                            </Button>
                        </Toolbar>
                    )}
                </Paper>
            </Provider>
        );
    }
);
FileExplorer.displayName = 'FileExplorer';
export default FileExplorer;
