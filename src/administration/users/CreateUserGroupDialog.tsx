import * as React from 'react';
import { useMutation } from '@apollo/client';
import { TenantModel, UserGroupModel } from 'model';
import { Button } from 'shared/general/button/Button';
import {
    Dialog,
    DialogActions,
    DialogContent,
} from 'shared/general/dialog/Dialog';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { Input } from 'shared/general/form/input/Input';
import { Label } from 'shared/general/label/Label';

import CreateUserGroupMutation from 'api/mutation/CreateUserGroupMutation.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

export interface CreateUserGroupDialogProps {
    isOpen: boolean;
    onAbort(): void;
    onConfirm(group: UserGroupModel): void;
}

export const CreateUserGroupDialog = React.memo<CreateUserGroupDialogProps>(
    ({ isOpen, onAbort, onConfirm }) => {
        const [name, setName] = React.useState('');
        const [createUserGroup, { loading: isLoading, error }] = useMutation<
            { group: UserGroupModel },
            { group: Partial<UserGroupModel> }
        >(CreateUserGroupMutation, {
            update: (cache, { data }) => {
                if (data && data.group) {
                    const readTenantResult = cache.readQuery<{
                        tenant: TenantModel;
                    }>({ query: GetTenantQuery });
                    cache.writeQuery<{ tenant: TenantModel }>({
                        query: GetTenantQuery,
                        data: {
                            tenant: {
                                ...readTenantResult!.tenant,
                                groups: [
                                    ...readTenantResult!.tenant.groups,
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
            <Dialog
                open={isOpen}
                onRequestClose={onAbort}
                title={'Nutzergruppe erstellen'}
            >
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
                    <DialogContent>
                        <p>Erstelle eine neue Gruppe</p>
                        <ErrorMessage error={error} />
                        <Label label="Name der Gruppe:">
                            <Input
                                autoFocus
                                required
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.currentTarget.value)}
                                disabled={isLoading}
                                placeholder="Neue Gruppe"
                            />
                        </Label>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                resetForm();
                                onAbort();
                            }}
                        >
                            Abbrechen
                        </Button>
                        <Button type={'submit'} disabled={!name || isLoading}>
                            Gruppe erstellen
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }
);
