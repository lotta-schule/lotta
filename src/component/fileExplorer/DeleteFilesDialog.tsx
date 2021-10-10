import * as React from 'react';
import { useMutation } from '@apollo/client';
import { FileModel, DirectoryModel } from 'model';
import { Button } from 'component/general/button/Button';
import {
    Dialog,
    DialogActions,
    DialogContent,
} from 'component/general/dialog/Dialog';
import { ErrorMessage } from 'component/general/ErrorMessage';
import fileExplorerContext from './context/FileExplorerContext';

import DeleteFileMutation from 'api/mutation/DeleteFileMutation.graphql';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

export const DeleteFilesDialog = React.memo(() => {
    const [state, dispatch] = React.useContext(fileExplorerContext);

    const [deleteFile, { error, loading: isLoading }] = useMutation(
        DeleteFileMutation,
        {
            update: (client, { data }) => {
                if (data?.file) {
                    const cache = client.readQuery<{
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
                            files: cache?.files?.filter(
                                (f) => f.id !== data.file.id
                            ),
                            directories: [...(cache?.directories ?? [])],
                        },
                    });
                }
            },
        }
    );

    React.useEffect(() => {
        if (state.showDeleteFiles) {
        }
    }, [state.showDeleteFiles]);

    return (
        <Dialog
            open={state.showDeleteFiles}
            onRequestClose={() => dispatch({ type: 'hideDeleteFiles' })}
            title={'Dateien löschen'}
        >
            <ErrorMessage error={error} />
            <DialogContent>
                Möchtest du die folgenden Dateien wirklich löschen? Sie sind
                dann unwiederbringlich verloren. Sollten Sie in Beiträgen,
                Modulen oder als Profilbild verwendet werden, wird die Referenz
                auch dort entfernt.
                <ul>
                    {state.markedFiles.map((file) => (
                        <li key={file.id}>{file.filename}</li>
                    ))}
                </ul>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => dispatch({ type: 'hideDeleteFiles' })}>
                    Abbrechen
                </Button>
                <Button
                    disabled={isLoading}
                    onClick={async () => {
                        try {
                            await Promise.all(
                                state.markedFiles.map(async (file) => {
                                    const { data } = await deleteFile({
                                        variables: { id: file.id },
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
                            dispatch({ type: 'hideDeleteFiles' });
                        } catch (e) {
                            console.error(
                                `error deleting one or more files: `,
                                e
                            );
                        }
                    }}
                >
                    Dateien endgültig löschen
                </Button>
            </DialogActions>
        </Dialog>
    );
});
