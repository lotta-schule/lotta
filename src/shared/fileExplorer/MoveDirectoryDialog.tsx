import * as React from 'react';
import { CreateNewFolderOutlined } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { DirectoryModel, ID } from 'model';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    ErrorMessage,
    Tooltip,
} from '@lotta-schule/hubert';
import { DirectorySelector } from './directorySelector/DirectorySelector';
import { CreateNewDirectoryDialog } from './CreateNewDirectoryDialog';
import fileExplorerContext from './context/FileExplorerContext';

import UpdateDirectoryMutation from 'api/mutation/UpdateDirectoryMutation.graphql';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

export const MoveDirectoryDialog = React.memo(() => {
    const [state, dispatch] = React.useContext(fileExplorerContext);
    const [selectedDirectoryId, setSelectedDirectoryId] =
        React.useState<ID | null>(null);
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
                <Tooltip label={'Ordner erstellen'}>
                    <Button
                        aria-label="Ordner erstellen"
                        onClick={() => setIsCreateNewFolderDialogOpen(true)}
                        icon={<CreateNewFolderOutlined color={'secondary'} />}
                    />
                </Tooltip>
                <DirectorySelector
                    onSelectDirectoryId={setSelectedDirectoryId}
                />
                <CreateNewDirectoryDialog
                    parentDirectoryId={selectedDirectoryId}
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
                        selectedDirectoryId === state.markedDirectories[0]?.id
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
                                                    selectedDirectoryId ?? null,
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
