import React, { memo, useState, useContext } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { CreateNewFolderOutlined } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { CreateNewDirectoryDialog } from './CreateNewDirectoryDialog';
import { DirectoryTree } from './directoryTree/DirectoryTree';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { DirectoryModel } from 'model';
import fileExplorerContext from './context/FileExplorerContext';
import UpdateDirectoryMutation from 'api/mutation/UpdateDirectoryMutation.graphql';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

export const MoveDirectoryDialog = memo(() => {
    const [state, dispatch] = useContext(fileExplorerContext);
    const [selectedDirectory, setSelectedDirectory] = useState(
        state.currentPath[state.currentPath.length - 1].id === null
            ? null
            : (state.currentPath[
                  state.currentPath.length - 1
              ] as DirectoryModel)
    );
    const [isCreateNewFolderDialogOpen, setIsCreateNewFolderDialogOpen] =
        useState(false);

    const [moveDirectory, { error, loading: isLoading }] = useMutation<{
        directory: DirectoryModel;
    }>(UpdateDirectoryMutation, {
        update: (client, { data }) => {
            if (data?.directory) {
                const fromDirId =
                    state.currentPath[state.currentPath.length - 1].id;
                const cacheFrom = client.readQuery<{
                    files: DirectoryModel[];
                    directories: DirectoryModel[];
                }>({
                    query: GetDirectoriesAndFilesQuery,
                    variables: { parentDirectoryId: fromDirId },
                });
                client.writeQuery({
                    query: GetDirectoriesAndFilesQuery,
                    variables: { parentDirectoryId: fromDirId },
                    data: {
                        files: [...(cacheFrom?.files ?? [])],
                        directories: cacheFrom?.directories?.filter(
                            (d) => d.id !== data.directory.id
                        ),
                    },
                });
                const cacheTo = client.readQuery<{
                    files: DirectoryModel[];
                    directories: DirectoryModel[];
                }>({
                    query: GetDirectoriesAndFilesQuery,
                    variables: {
                        parentDirectoryId:
                            data.directory.parentDirectory?.id ?? null,
                    },
                });
                client.writeQuery({
                    query: GetDirectoriesAndFilesQuery,
                    variables: {
                        parentDirectoryId:
                            data.directory.parentDirectory?.id ?? null,
                    },
                    data: {
                        files: [...(cacheFrom?.files ?? [])],
                        directories: [
                            ...(cacheTo?.directories ?? []),
                            {
                                ...state.markedDirectories.find(
                                    (d) => d.id === data.directory.id
                                ),
                                ...data.directory,
                            },
                        ],
                    },
                });
            }
        },
    });

    return (
        <ResponsiveFullScreenDialog
            fullWidth
            maxWidth={'sm'}
            open={state.showMoveDirectory}
            aria-labelledby={'select-directories-tree-dialog'}
            onClose={() => dispatch({ type: 'hideMoveDirectory' })}
        >
            <DialogTitle id={'select-directories-tree-dialog-title'}>
                Ordner verschieben
            </DialogTitle>
            <DialogContent>
                <DialogContentText>Wähle ein Zielort</DialogContentText>
                <ErrorMessage error={error} />
                <Tooltip title={'Ordner erstellen'}>
                    <Button
                        aria-label="Ordner erstellen"
                        onClick={() => setIsCreateNewFolderDialogOpen(true)}
                        icon={<CreateNewFolderOutlined color={'secondary'} />}
                    />
                </Tooltip>
                <DirectoryTree
                    defaultExpandedDirectoryIds={state.currentPath.map((d) =>
                        String(d.id ?? 'null')
                    )}
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
                <Button onClick={() => dispatch({ type: 'hideMoveDirectory' })}>
                    Abbrechen
                </Button>
                <Button
                    disabled={
                        isLoading ||
                        selectedDirectory?.id === state.markedDirectories[0]?.id
                    }
                    onClick={async () => {
                        try {
                            await Promise.all(
                                state.markedDirectories.map(
                                    async (directory) => {
                                        const { data } = await moveDirectory({
                                            variables: {
                                                id: directory.id,
                                                parentDirectoryId:
                                                    selectedDirectory?.id ??
                                                    null,
                                            },
                                        });
                                        if (data) {
                                            dispatch({
                                                type: 'resetMarkedDirectories',
                                            });
                                        }
                                    }
                                )
                            );
                            dispatch({ type: 'hideMoveDirectory' });
                        } catch (e) {
                            console.error(
                                `error deleting one or more files: `,
                                e
                            );
                        }
                    }}
                >
                    Ordner verschieben
                </Button>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});
