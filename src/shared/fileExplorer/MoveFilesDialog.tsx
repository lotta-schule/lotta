import * as React from 'react';
import { Tooltip } from '@material-ui/core';
import { CreateNewFolderOutlined } from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { Button } from 'shared/general/button/Button';
import {
    Dialog,
    DialogActions,
    DialogContent,
} from 'shared/general/dialog/Dialog';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { DirectoryModel, FileModel } from 'model';
import { CreateNewDirectoryDialog } from './CreateNewDirectoryDialog';
import { DirectoryTree } from './directoryTree/DirectoryTree';
import fileExplorerContext from './context/FileExplorerContext';

import UpdateFileMutation from 'api/mutation/UpdateFileMutation.graphql';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

export const MoveFilesDialog = React.memo(() => {
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

    const [moveFile, { error, loading: isLoading }] = useMutation(
        UpdateFileMutation,
        {
            update: (client, { data }) => {
                if (data?.file) {
                    const fromDirId =
                        state.currentPath[state.currentPath.length - 1].id;
                    const cacheFrom = client.readQuery<{
                        files: FileModel[];
                        directories: DirectoryModel[];
                    }>({
                        query: GetDirectoriesAndFilesQuery,
                        variables: { parentDirectoryId: fromDirId },
                    });
                    client.writeQuery({
                        query: GetDirectoriesAndFilesQuery,
                        variables: { parentDirectoryId: fromDirId },
                        data: {
                            files: cacheFrom?.files?.filter(
                                (f) => f.id !== data.file.id
                            ),
                            directories: [...(cacheFrom?.directories ?? [])],
                        },
                    });
                    const cacheTo = client.readQuery<{
                        files: FileModel[];
                        directories: DirectoryModel[];
                    }>({
                        query: GetDirectoriesAndFilesQuery,
                        variables: {
                            parentDirectoryId: data.file.parentDirectory.id,
                        },
                    });
                    client.writeQuery({
                        query: GetDirectoriesAndFilesQuery,
                        variables: {
                            parentDirectoryId: data.file.parentDirectory.id,
                        },
                        data: {
                            files: [
                                ...(cacheTo?.files ?? []),
                                {
                                    ...state.markedFiles.find(
                                        (f) => f.id === data.file.id
                                    ),
                                    ...data.file,
                                },
                            ],
                            directories: [...(cacheTo?.directories ?? [])],
                        },
                    });
                }
            },
        }
    );

    return (
        <Dialog
            open={state.showMoveFiles}
            onRequestClose={() => dispatch({ type: 'hideMoveFiles' })}
            title={'Dateien verschieben'}
        >
            <DialogContent>
                <p>Wähle ein Zielort</p>
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
                <Button
                    color={'primary'}
                    onClick={() => dispatch({ type: 'hideMoveFiles' })}
                >
                    Abbrechen
                </Button>
                <Button
                    disabled={isLoading || selectedDirectory === null}
                    onClick={async () => {
                        try {
                            await Promise.all(
                                state.markedFiles.map(async (file) => {
                                    const { data } = await moveFile({
                                        variables: {
                                            id: file.id,
                                            parentDirectoryId:
                                                selectedDirectory!.id,
                                        },
                                    });
                                    if (data) {
                                        dispatch({
                                            type: 'setMarkedFiles',
                                            files: state.markedFiles.filter(
                                                (f) => f.id !== file.id
                                            ),
                                        });
                                    }
                                })
                            );
                            dispatch({ type: 'hideMoveFiles' });
                        } catch (e) {
                            console.error(
                                `error deleting one or more files: `,
                                e
                            );
                        }
                    }}
                >
                    Dateien verschieben
                </Button>
            </DialogActions>
        </Dialog>
    );
});
MoveFilesDialog.displayName = 'MoveFilesDialog';
