import React, { FunctionComponent, memo, useState } from 'react';
import { DialogTitle, DialogContent, DialogContentText, TextField, Button, DialogActions } from '@material-ui/core';
import { FileModel, FileModelType } from 'model';
import { useApolloClient } from '@apollo/react-hooks';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { GetUserFilesQuery } from 'api/query/GetUserFiles';

export interface CreateNewFolderDialogProps {
    basePath?: string;
    open: boolean;
    onClose(event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'auto'): void;
}

export const CreateNewFolderDialog: FunctionComponent<CreateNewFolderDialogProps> = memo(({ basePath, open, onClose }) => {

    const [path, setPath] = useState('');
    const client = useApolloClient();

    return (
        <ResponsiveFullScreenDialog open={open} onClose={onClose} aria-labelledby="create-new-folder-dialog-title">
            <DialogTitle id="create-new-folder-dialog-title">Neuen Ordner erstellen</DialogTitle>
            <DialogContent>
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
                    onClick={e => onClose(e, 'auto')}
                >
                    Abbrechen
                </Button>
                <Button
                    color="primary"
                    onClick={() => {
                        const tmpFile: FileModel = {
                            id: new Date().getTime(),
                            fileType: FileModelType.Misc,
                            filename: '.lotta-keep',
                            filesize: 0,
                            insertedAt: new Date().toString(),
                            updatedAt: new Date().toString(),
                            mimeType: 'application/medienportal-keep-dir',
                            path: [basePath, path].filter(Boolean).join(basePath === '/' ? '' : '/'),
                            remoteLocation: '',
                            fileConversions: [],
                            __typename: 'File'
                        } as any;
                        const data = client.readQuery<{ files: FileModel[] }>({ query: GetUserFilesQuery }) || { files: [] };
                        client.writeQuery({
                            query: GetUserFilesQuery,
                            data: {
                                files: [...data.files, tmpFile]
                            }
                        });
                        onClose({}, 'auto');
                    }}
                >
                    Ordner anlegen
                </Button>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});