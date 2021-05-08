import React, { FunctionComponent, memo, useState, useEffect } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    TextField,
    DialogActions,
    FormControlLabel,
    Checkbox,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { DirectoryModel, FileModel, ID } from 'model';
import { useMutation } from '@apollo/client';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { GetDirectoriesAndFilesQuery } from 'api/query/GetDirectoriesAndFiles';
import { CreateDirectoryMutation } from 'api/mutation/CreateDirectoryMutation';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';

export interface CreateNewFolderDialogProps {
    basePath?: ({ id: null } | { id: ID; name: string })[];
    open: boolean;
    onClose(
        event: {},
        reason: 'backdropClick' | 'escapeKeyDown' | 'auto'
    ): void;
}

export const CreateNewDirectoryDialog: FunctionComponent<CreateNewFolderDialogProps> = memo(
    ({ basePath, open, onClose }) => {
        const parentDirectoryId = basePath?.[basePath.length - 1].id ?? null;
        const currentUser = useCurrentUser();
        const [name, setName] = useState('');
        const [isPublic, setIsPublic] = useState(false);
        useEffect(() => {
            if (open) {
                setIsPublic(false);
            }
        }, [open]);
        const [createDirectory, { error, loading: isLoading }] = useMutation<{
            directory: DirectoryModel;
        }>(CreateDirectoryMutation, {
            variables: { name, parentDirectoryId, isPublic },
            update: (cache, { data }) => {
                const cached = cache.readQuery<{
                    directories: DirectoryModel[];
                    files: FileModel[];
                }>({
                    query: GetDirectoriesAndFilesQuery,
                    variables: { parentDirectoryId },
                });
                cache.writeQuery({
                    query: GetDirectoriesAndFilesQuery,
                    variables: { parentDirectoryId },
                    data: {
                        directories: [
                            ...(cached?.directories ?? []),
                            data!.directory,
                        ],
                        files: cached?.files ?? [],
                    },
                });
            },
            onCompleted: () => {
                onClose({}, 'auto');
            },
        });

        return (
            <ResponsiveFullScreenDialog
                open={open}
                onClose={onClose}
                aria-labelledby="create-new-folder-dialog-title"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        createDirectory();
                    }}
                >
                    <DialogTitle id="create-new-folder-dialog-title">
                        Neuen Ordner erstellen
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Wähle einen Namen für den Ordner, den du erstellen
                            möchtest.
                        </DialogContentText>
                        <ErrorMessage error={error} />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Name des Ordners"
                            type="text"
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                        />
                        {User.isAdmin(currentUser) &&
                            basePath?.slice(-1)[0].id === null && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={isPublic}
                                            onChange={(e, checked) =>
                                                setIsPublic(checked)
                                            }
                                        />
                                    }
                                    label={
                                        'Diesen Ordner für alle registrierten Nutzer sichtbar machen. Administratoren dürfen öffentliche Ordner bearbeiten.'
                                    }
                                />
                            )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={(e) => onClose(e, 'auto')}>
                            Abbrechen
                        </Button>
                        <Button type={'submit'} disabled={isLoading}>
                            Ordner erstellen
                        </Button>
                    </DialogActions>
                </form>
            </ResponsiveFullScreenDialog>
        );
    }
);
