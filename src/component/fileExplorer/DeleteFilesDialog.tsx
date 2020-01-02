import React, { memo } from 'react';
import { DialogTitle, DialogContent, DialogContentText, Button, DialogActions } from '@material-ui/core';
import { useMutation } from '@apollo/react-hooks';
import { FileModel } from 'model';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { useFileExplorerData } from './context/useFileExplorerData';
import { DeleteFileMutation } from 'api/mutation/DeleteFileMutation';
import { GetUserFilesQuery } from 'api/query/GetUserFiles';

export const DeleteFilesDialog = memo(() => {

    const [state, dispatch] = useFileExplorerData();

    const [deleteFile] = useMutation(DeleteFileMutation, {
        update: (cache, { data: { file } }) => {
            dispatch({ type: "resetMarkedFiles" });
            if (file) {
                const data = cache.readQuery<{ files: FileModel[] }>({ query: GetUserFilesQuery }) || { files: [] };
                cache.writeQuery({
                    query: GetUserFilesQuery,
                    data: {
                        files: data.files.filter(f => f.id !== file.id)
                    }
                });
            }
        }
    });

    const getFullFilePath = (file: FileModel) => {
        if (file.path === '/') {
            return `/${file.filename}`;
        }
        return [file.path, file.filename].join('/');
    }

    return (
        <ResponsiveFullScreenDialog open={state.showDeleteFiles} onClose={() => dispatch({ type: 'hideDeleteFiles' })} aria-labelledby="select-directory-tree-dialog">
            <DialogTitle id="select-directory-tree-dialog-title">Dateien löschen</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Möchtest du die folgenden Dateien wirklich löschen? Sie sind dann unwiederbringlich verloren.
                </DialogContentText>
                <DialogContentText>
                    Sollten Sie in Beiträgen, Modulen oder als Profilbild verwendet werden, wird die Referenz auch dort entfernt.
                </DialogContentText>
                <DialogContentText>
                    <ul>
                        {state.markedFiles.map(file => (
                            <li key={file.id}>{getFullFilePath(file)}</li>
                        ))}
                    </ul>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    color={'primary'}
                    onClick={() => dispatch({ type: 'hideDeleteFiles' })}
                >
                    Abbrechen
                </Button>
                <Button
                    color={'secondary'}
                    onClick={() => {
                        state.markedFiles.forEach(file => deleteFile({ variables: { id: file.id } }));
                        dispatch({ type: 'hideDeleteFiles' });
                    }}
                >
                    Dateien endgültig löschen
                </Button>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});