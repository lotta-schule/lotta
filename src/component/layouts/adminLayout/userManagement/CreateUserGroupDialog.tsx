import React, { memo, useState } from 'react';
import {
    Button,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { ClientModel, UserGroupModel } from 'model';
import { CreateUserGroupMutation } from 'api/mutation/CreateUserGroupMutation';
import { GetSystemQuery } from 'api/query/GetSystemQuery';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { ErrorMessage } from 'component/general/ErrorMessage';

export interface CreateUserGroupDialogProps {
    isOpen: boolean;
    onAbort(): void;
    onConfirm(group: UserGroupModel): void;
}

export const CreateUserGroupDialog = memo<CreateUserGroupDialogProps>(
    ({ isOpen, onAbort, onConfirm }) => {
        const [name, setName] = useState('');
        const [createUserGroup, { loading: isLoading, error }] = useMutation<
            { group: UserGroupModel },
            { group: Partial<UserGroupModel> }
        >(CreateUserGroupMutation, {
            update: (cache, { data }) => {
                if (data && data.group) {
                    const readSystemResult = cache.readQuery<{
                        system: ClientModel;
                    }>({ query: GetSystemQuery });
                    cache.writeQuery<{ system: ClientModel }>({
                        query: GetSystemQuery,
                        data: {
                            system: {
                                ...readSystemResult!.system,
                                groups: [
                                    ...readSystemResult!.system.groups,
                                    data.group,
                                ],
                            },
                        },
                    });
                }
            },
            onCompleted: ({ group }) => {
                onConfirm(group);
            },
        });
        const resetForm = () => {
            setName('');
        };
        return (
            <ResponsiveFullScreenDialog open={isOpen} fullWidth>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        createUserGroup({
                            variables: {
                                group: {
                                    name,
                                },
                            },
                        });
                    }}
                >
                    <DialogTitle>Nutzergruppe erstellen</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Erstelle eine neue Gruppe
                        </DialogContentText>
                        <ErrorMessage error={error} />
                        <TextField
                            margin="dense"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            label="Name der Gruppe:"
                            placeholder="Neue Gruppe"
                            type="text"
                            autoFocus
                            required
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                resetForm();
                                onAbort();
                            }}
                            color="secondary"
                            variant="outlined"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type={'submit'}
                            disabled={!name || isLoading}
                            color="secondary"
                            variant="contained"
                        >
                            Gruppe erstellen
                        </Button>
                    </DialogActions>
                </form>
            </ResponsiveFullScreenDialog>
        );
    }
);
