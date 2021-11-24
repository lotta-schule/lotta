import * as React from 'react';
import { Tooltip } from '@material-ui/core';
import { CreateNewFolderOutlined } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { DirectoryModel } from 'model';
import { Button } from 'shared/general/button/Button';
import {
    Dialog,
    DialogActions,
    DialogContent,
} from 'shared/general/dialog/Dialog';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { DirectoryTree } from './directoryTree/DirectoryTree';
import { CreateNewDirectoryDialog } from './CreateNewDirectoryDialog';
import fileExplorerContext from './context/FileExplorerContext';

import UpdateDirectoryMutation from 'api/mutation/UpdateDirectoryMutation.graphql';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

export const MoveDirectoryDialog = React.memo(() => {
    const [state, dispatch] = React.useContext(fileExplorerContext);
    const [selectedDirectory, setSelectedDirectory] = React.useState(
        state.currentPath[state.currentPath.length - 1].id === null
            ? null
            : (state.currentPath[
                  state.currentPath.length - 1
              ] as DirectoryModel)
    );
    const [isCreateNewFolderDialogOpen, setIsCreateNewFolderDialogOpen] =
        React.useState(false);

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
        <Dialog
            open={state.showMoveDirectory}
            onRequestClose={() => dispatch({ type: 'hideMoveDirectory' })}
            title={'Ordner verschieben'}
        >
            <DialogContent>
                Wähle ein Zielort
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
                    onRequestClose={() => setIsCreateNewFolderDialogOpen(false)}
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
        </Dialog>
    );
});
MoveDirectoryDialog.displayName = 'MoveDirectoryDialog';
