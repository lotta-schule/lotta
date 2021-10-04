import * as React from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { DirectoryModel, FileModel, ID } from 'model';
import { Button } from 'component/general/button/Button';
import { Checkbox } from 'component/general/form/checkbox';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { Input } from 'component/general/form/input/Input';
import { Label } from 'component/general/label/Label';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import CreateDirectoryMutation from 'api/mutation/CreateDirectoryMutation.graphql';
import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

export interface CreateNewFolderDialogProps {
    basePath?: ({ id: null } | { id: ID; name: string })[];
    open: boolean;
    onClose(
        event: {},
        reason: 'backdropClick' | 'escapeKeyDown' | 'auto'
    ): void;
}

export const CreateNewDirectoryDialog = React.memo<CreateNewFolderDialogProps>(
    ({ basePath, open, onClose }) => {
        const parentDirectoryId = basePath?.[basePath.length - 1].id ?? null;
        const currentUser = useCurrentUser();
        const [name, setName] = React.useState('');
        const [isPublic, setIsPublic] = React.useState(false);
        React.useEffect(() => {
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
                        <Label label={'Name des Ordners'}>
                            <Input
                                autoFocus
                                onChange={({ currentTarget }) =>
                                    setName(currentTarget.value)
                                }
                            />
                        </Label>
                        {User.isAdmin(currentUser) &&
                            basePath?.slice(-1)[0].id === null && (
                                <Checkbox
                                    checked={isPublic}
                                    label={
                                        'Diesen Ordner für alle registrierten Nutzer sichtbar machen. Administratoren dürfen öffentliche Ordner bearbeiten.'
                                    }
                                    onChange={(e) =>
                                        setIsPublic(e.currentTarget.checked)
                                    }
                                />
                            )}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={(e: React.MouseEvent) =>
                                onClose(e, 'auto')
                            }
                        >
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
