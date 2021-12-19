import * as React from 'react';
import { useMutation } from '@apollo/client';
import { TenantModel, UserGroupModel, ID } from 'model';
import { Button } from 'shared/general/button/Button';
import {
    Dialog,
    DialogActions,
    DialogContent,
} from 'shared/general/dialog/Dialog';
import { ErrorMessage } from 'shared/general/ErrorMessage';

import DeleteUserGroupMutation from 'api/mutation/DeleteUserGroupMutation.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

export interface DeleteUserGroupDialogProps {
    isOpen: boolean;
    group: UserGroupModel;
    onRequestClose(): void;
    onConfirm(): void;
}

export const DeleteUserGroupDialog = React.memo<DeleteUserGroupDialogProps>(
    ({ isOpen, group, onRequestClose, onConfirm }) => {
        const [deleteUserGroup, { loading: isLoading, error }] = useMutation<
            { group: UserGroupModel },
            { id: ID }
        >(DeleteUserGroupMutation, {
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
                                groups: readTenantResult!.tenant.groups.filter(
                                    (g) => g.id !== data.group.id
                                ),
                            },
                        },
                    });
                }
            },
            onCompleted: () => {
                onConfirm();
            },
        });

        return (
            <Dialog
                open={isOpen}
                onRequestClose={onRequestClose}
                title={'Gruppe löschen'}
            >
                <DialogContent>
                    <ErrorMessage error={error} />
                    <p>
                        Möchtest du die Nutzergruppe "{group.name}" wirklich
                        löschen? Sie ist dann unwiederbringlich verloren.
                    </p>
                    <p>
                        Beiträge und Kategorien, die <em>ausschließlich</em> für
                        diese Gruppe sichtbar waren, werden dann öffentlich
                        sichtbar.
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => onRequestClose()}
                        disabled={isLoading}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={() =>
                            deleteUserGroup({ variables: { id: group.id } })
                        }
                        disabled={isLoading}
                    >
                        Gruppe endgültig löschen
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
);
DeleteUserGroupDialog.displayName = 'DeleteUserGroupDialog';
