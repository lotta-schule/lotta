import React, { memo, useContext, useState, useEffect } from 'react';
import { DialogTitle, DialogContent, DialogContentText, Button, DialogActions, Typography } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';
import { FileModel, DirectoryModel } from 'model';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { DeleteFileMutation } from 'api/mutation/DeleteFileMutation';
import { GetDirectoriesAndFilesQuery } from 'api/query/GetDirectoriesAndFiles';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { SaveButton } from 'component/general/SaveButton';
import fileExplorerContext from './context/FileExplorerContext';

export const DeleteFilesDialog = memo(() => {
    const [state, dispatch] = useContext(fileExplorerContext);
    const [isShowSuccess, setIsShowSuccess] = useState(false);

    const [deleteFile, { error, loading: isLoading }] = useMutation(DeleteFileMutation, {
        update: (client, { data }) => {
            if (data?.file) {
                const cache = client.readQuery<{ files: FileModel[], directories: DirectoryModel[] }>({
                    query: GetDirectoriesAndFilesQuery,
                    variables: { parentDirectoryId: data.file.parentDirectory.id }
                });
                client.writeQuery({
                    query: GetDirectoriesAndFilesQuery,
                    variables: { parentDirectoryId: data.file.parentDirectory.id },
                    data: {
                        files: cache?.files?.filter(f => f.id !== data.file.id),
                        directories: [...(cache?.directories ?? [])]
                    }
                });
            }
        }
    });

    useEffect(() => {
        if (state.showDeleteFiles) {
            setIsShowSuccess(false);
        }
    }, [state.showDeleteFiles]);

    return (
        <ResponsiveFullScreenDialog open={state.showDeleteFiles} onClose={() => dispatch({ type: 'hideDeleteFiles' })} aria-labelledby="select-directory-tree-dialog">
            <DialogTitle id="select-directory-tree-dialog-title">Dateien löschen</DialogTitle>
            <ErrorMessage error={error} />
            <DialogContent>
                <DialogContentText>
                    Möchtest du die folgenden Dateien wirklich löschen? Sie sind dann unwiederbringlich verloren.
                </DialogContentText>
                <DialogContentText>
                    Sollten Sie in Beiträgen, Modulen oder als Profilbild verwendet werden, wird die Referenz auch dort entfernt.
                </DialogContentText>
                <Typography variant={'body1'} component={'ul'}>
                    {state.markedFiles.map(file => (
                        <li key={file.id}>{file.filename}</li>
                    ))}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button color={'primary'} onClick={() => dispatch({ type: 'hideDeleteFiles' })} >
                    Abbrechen
                </Button>
                <SaveButton
                    isLoading={isLoading}
                    isSuccess={isShowSuccess}
                    onClick={async () => {
                        try {
                            await Promise.all(state.markedFiles.map(async file => {
                                const { data } = await deleteFile({ variables: { id: file.id } });
                                if (data) {
                                    dispatch({
                                        type: 'setMarkedFiles',
                                        files: state.markedFiles.filter(f => f.id !== file.id)
                                    });
                                }
                            }));
                            setIsShowSuccess(true);
                            dispatch({ type: 'hideDeleteFiles' });
                        } catch (e) {
                            console.error(`error deleting one or more files: `, e);
                        }
                    }}
                >
                    Dateien endgültig löschen
                </SaveButton>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});