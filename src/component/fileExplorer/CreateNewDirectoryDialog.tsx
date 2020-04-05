import React, { FunctionComponent, memo, useState, useEffect } from 'react';
import { DialogTitle, DialogContent, DialogContentText, TextField, Button, DialogActions } from '@material-ui/core';
import { DirectoryModel, FileModel } from 'model';
import { useMutation } from '@apollo/react-hooks';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { GetDirectoriesAndFilesQuery } from 'api/query/GetDirectoriesAndFiles';
import { CreateDirectoryMutation } from 'api/mutation/CreateDirectoryMutation';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { SaveButton } from 'component/general/SaveButton';

export interface CreateNewFolderDialogProps {
    basePath?: ({ id: null } | { id: number; name: string })[];
    open: boolean;
    onClose(event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'auto'): void;
}

export const CreateNewDirectoryDialog: FunctionComponent<CreateNewFolderDialogProps> = memo(({ basePath, open, onClose }) => {
    const parentDirectoryId = basePath?.[basePath.length - 1].id ?? null;
    const [name, setName] = useState('');
    const [isShowSuccess, setIsShowSuccess] = useState(false);
    useEffect(() => {
        if (open) {
            setIsShowSuccess(false);
        }
    }, [open]);
    const [createDirectory, { error, loading: isLoading }] = useMutation<{ directory: DirectoryModel }>(CreateDirectoryMutation, {
        variables: { name, parentDirectoryId },
        update: (cache, { data }) => {
            const cached = cache.readQuery<{ directories: DirectoryModel[], files: FileModel[] }>({ query: GetDirectoriesAndFilesQuery, variables: { parentDirectoryId } });
            cache.writeQuery({
                query: GetDirectoriesAndFilesQuery,
                variables: { parentDirectoryId },
                data: { directories: [...(cached?.directories ?? []), data!.directory], files: cached?.files ?? [] }
            });
        },
        onCompleted: () => {
            setIsShowSuccess(true);
            onClose({}, 'auto');
        }
    });

    return (
        <ResponsiveFullScreenDialog open={open} onClose={onClose} aria-labelledby="create-new-folder-dialog-title">
            <form onSubmit={e => { e.preventDefault(); createDirectory(); }}>
                <DialogTitle id="create-new-folder-dialog-title">Neuen Ordner erstellen</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Wähle einen Namen für den Ordner, den du erstellen möchtest.
                </DialogContentText>
                    <ErrorMessage error={error} />
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name des Ordners"
                        type="text"
                        onChange={e => setName(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={e => onClose(e, 'auto')}>
                        Abbrechen
                </Button>
                    <SaveButton
                        type={'submit'}
                        isLoading={isLoading}
                        isSuccess={isShowSuccess}
                    >
                        Ordner erstellen
                    </SaveButton>
                </DialogActions>
            </form>
        </ResponsiveFullScreenDialog >
    );
});