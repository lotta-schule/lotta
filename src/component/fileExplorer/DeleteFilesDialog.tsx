import React, { memo } from 'react';
import { DialogTitle, DialogContent, DialogContentText, Button, DialogActions } from '@material-ui/core';
import { FileModel } from 'model';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';

export interface DeleteFilesDialogProps {
    open: boolean;
    filesToDelete: FileModel[];
    onClose(event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'auto'): void;
    onConfirm(): void;
}

export const DeleteFilesDialog = memo<DeleteFilesDialogProps>(({ open, filesToDelete, onClose, onConfirm }) => {

    const getFullFilePath = (file: FileModel) => {
        if (file.path === '/') {
            return `/${file.filename}`;
        }
        return [file.path, file.filename].join('/');
    }

    return (
        <ResponsiveFullScreenDialog open={open} onClose={onClose} aria-labelledby="select-directory-tree-dialog">
            <DialogTitle id="select-directory-tree-dialog-title">Dateien löschen</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Möchtest du die folgenden Dateien wirklich löschen? Sie sind dann unwiederbringlich verloren.
                </DialogContentText>
                <DialogContentText>
                    Sollten Sie in Beiträgen, Modulen oder als Profilbild verwendet werden, wird die Referenz auch dort entfernt.
                </DialogContentText>
                <DialogContentText component={'ul'}>
                    {filesToDelete.map(file => (
                        <li key={file.id}>{getFullFilePath(file)}</li>
                    ))}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    color={'primary'}
                    onClick={e => onClose(e, 'auto')}
                >
                    Abbrechen
                </Button>
                <Button
                    color={'secondary'}
                    onClick={() => onConfirm()}
                >
                    Dateien endgültig löschen
                </Button>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});