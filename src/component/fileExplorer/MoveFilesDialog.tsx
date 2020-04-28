import React, { memo, useState, useContext, useEffect } from 'react';
import { DialogTitle, DialogContent, DialogContentText, Button, DialogActions, Tooltip, IconButton } from '@material-ui/core';
import { CreateNewFolderOutlined } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { DirectoryModel, FileModel } from 'model';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { UpdateFileMutation } from 'api/mutation/UpdateFileMutation';
import { CreateNewDirectoryDialog } from './CreateNewDirectoryDialog';
import { DirectoryTree } from './directoryTree/DirectoryTree';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { SaveButton } from 'component/general/SaveButton';
import { GetDirectoriesAndFilesQuery } from 'api/query/GetDirectoriesAndFiles';
import fileExplorerContext from './context/FileExplorerContext';

export const MoveFilesDialog = memo(() => {
    const [state, dispatch] = useContext(fileExplorerContext);
    const [selectedDirectory, setSelectedDirectory] = useState(state.currentPath[state.currentPath.length - 1].id === null ? null : state.currentPath[state.currentPath.length - 1] as DirectoryModel);
    const [isCreateNewFolderDialogOpen, setIsCreateNewFolderDialogOpen] = useState(false);

    const [isShowSuccess, setIsShowSuccess] = useState(false);

    const [moveFile, { error, loading: isLoading }] = useMutation(UpdateFileMutation, {
        update: (client, { data }) => {
            if (data?.file) {
                const fromDirId = state.currentPath[state.currentPath.length - 1].id;
                const cacheFrom = client.readQuery<{ files: FileModel[], directories: DirectoryModel[] }>({
                    query: GetDirectoriesAndFilesQuery,
                    variables: { parentDirectoryId: fromDirId }
                });
                client.writeQuery({
                    query: GetDirectoriesAndFilesQuery,
                    variables: { parentDirectoryId: fromDirId },
                    data: {
                        files: cacheFrom?.files?.filter(f => f.id !== data.file.id),
                        directories: [...(cacheFrom?.directories ?? [])]
                    }
                });
                const cacheTo = client.readQuery<{ files: FileModel[], directories: DirectoryModel[] }>({
                    query: GetDirectoriesAndFilesQuery,
                    variables: { parentDirectoryId: data.file.parentDirectory.id }
                });
                client.writeQuery({
                    query: GetDirectoriesAndFilesQuery,
                    variables: { parentDirectoryId: data.file.parentDirectory.id },
                    data: {
                        files: [...(cacheTo?.files ?? []), {
                            ...state.markedFiles.find(f => f.id === data.file.id),
                            ...data.file
                        }],
                        directories: [...(cacheTo?.directories ?? [])]
                    }
                });
            }
        }
    });

    useEffect(() => {
        if (state.showMoveFiles) {
            setIsShowSuccess(false);
        }
    }, [state.showMoveFiles]);

    return (
        <ResponsiveFullScreenDialog
            fullWidth
            maxWidth={'sm'}
            open={state.showMoveFiles}
            aria-labelledby={'select-directory-tree-dialog'}
            onClose={() => dispatch({ type: 'hideMoveFiles' })}
        >
            <DialogTitle id={'select-directory-tree-dialog-title'}>Dateien verschieben</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Wähle ein Zielort
                </DialogContentText>
                <ErrorMessage error={error} />
                <Tooltip title={'Ordner erstellen'}>
                    <IconButton aria-label="Ordner erstellen" onClick={() => setIsCreateNewFolderDialogOpen(true)}>
                        <CreateNewFolderOutlined color={'secondary'} />
                    </IconButton>
                </Tooltip>
                <DirectoryTree
                    defaultExpandedDirectoryIds={state.currentPath.map(d => String(d.id ?? 'null'))}
                    selectedDirectory={selectedDirectory}
                    onSelectDirectory={setSelectedDirectory}
                    showOnlyReadOnlyDirectories
                />
                <CreateNewDirectoryDialog
                    basePath={state.currentPath}
                    open={isCreateNewFolderDialogOpen}
                    onClose={() => setIsCreateNewFolderDialogOpen(false)}
                />
            </DialogContent>
            <DialogActions>
                <Button color={'primary'} onClick={() => dispatch({ type: 'hideMoveFiles' })}>
                    Abbrechen
                </Button>
                <SaveButton
                    isLoading={isLoading}
                    isSuccess={isShowSuccess}
                    disabled={selectedDirectory === null}
                    onClick={async () => {
                        try {
                            await Promise.all(state.markedFiles.map(async file => {
                                const { data } = await moveFile({ variables: { id: file.id, parentDirectoryId: selectedDirectory!.id } });
                                if (data) {
                                    dispatch({
                                        type: 'setMarkedFiles',
                                        files: state.markedFiles.filter(f => f.id !== file.id)
                                    });
                                }
                            }));
                            setIsShowSuccess(true);
                            dispatch({ type: 'hideMoveFiles' });
                        } catch (e) {
                            console.error(`error deleting one or more files: `, e);
                        }
                    }}
                >
                    Dateien verschieben
                </SaveButton>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});