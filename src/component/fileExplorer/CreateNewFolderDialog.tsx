import React, { FunctionComponent, memo, useState } from 'react';
import { DialogTitle, DialogContent, DialogContentText, TextField, Button, DialogActions } from '@material-ui/core';
import { FileModel, FileModelType } from 'model';
import { useDispatch } from 'react-redux';
import { createAddFileAction } from 'store/actions/userFiles';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';

export interface CreateNewFolderDialogProps {
    basePath?: string;
    open: boolean;
    onClose(event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'auto'): void;
}

export const CreateNewFolderDialog: FunctionComponent<CreateNewFolderDialogProps> = memo(({ basePath, open, onClose }) => {

    const [path, setPath] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const dispatch = useDispatch();

    return (
        <ResponsiveFullScreenDialog open={open} onClose={onClose} aria-labelledby="create-new-folder-dialog-title">
            <DialogTitle id="create-new-folder-dialog-title">Neuen Ordner erstellen</DialogTitle>
            <DialogContent>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <DialogContentText>
                    Wähle einen Namen für den Ordner, den du erstellen möchtest.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Name des Ordners"
                    type="text"
                    onChange={e => setPath(e.target.value)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    disabled={isLoading}
                    onClick={e => onClose(e, 'auto')}
                >
                    Abbrechen
                </Button>
                <Button
                    color="primary"
                    disabled={isLoading}
                    onClick={async () => {
                        setIsLoading(true);
                        setErrorMessage(null);
                        try {
                            const tmpFile: FileModel = {
                                id: new Date().getTime() + Math.random() * 1000,
                                fileType: FileModelType.Misc,
                                filename: '.lotta-keep',
                                filesize: 0,
                                insertedAt: new Date().toString(),
                                updatedAt: new Date().toString(),
                                mimeType: 'application/medienportal-keep-dir',
                                path: [basePath, path].filter(Boolean).join(basePath === '/' ? '' : '/'),
                                remoteLocation: '',
                                fileConversions: [],
                            };
                            dispatch(createAddFileAction(tmpFile));
                            onClose({}, 'auto');
                        } catch (e) {
                            setErrorMessage(e.message);
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                >
                    Ordner anlegen
                </Button>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});