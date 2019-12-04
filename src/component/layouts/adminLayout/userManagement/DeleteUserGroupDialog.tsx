import React, { memo } from 'react';
import { DialogTitle, DialogContent, DialogContentText, Button, DialogActions } from '@material-ui/core';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { ClientModel, UserGroupModel, ID } from 'model';
import { useMutation } from 'react-apollo';
import { GetTenantQuery } from 'api/query/GetTenantQuery';
import { DeleteUserGroupMutation } from 'api/mutation/DeleteUserGroupMutation';

export interface DeleteUserGroupDialogProps {
    isOpen: boolean;
    group: UserGroupModel;
    onClose(event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'auto'): void;
    onConfirm(): void;
}

export const DeleteUserGroupDialog = memo<DeleteUserGroupDialogProps>(({ isOpen, group, onClose, onConfirm }) => {
    const [deleteUserGroup, { loading: isLoading, error }] = useMutation<{ group: UserGroupModel }, { id: ID }>(DeleteUserGroupMutation, {
        update: (cache, { data }) => {
            if (data && data.group) {
                const readTenantResult = cache.readQuery<{ tenant: ClientModel }>({ query: GetTenantQuery });
                cache.writeQuery<{ tenant: ClientModel }>({
                    query: GetTenantQuery,
                    data: {
                        tenant: {
                            ...readTenantResult!.tenant,
                            groups: readTenantResult!.tenant.groups.filter(g => g.id !== data.group.id)
                        }
                    }
                });
            }
        },
        onCompleted: () => {
            onConfirm();
        }
    });

    return (
        <ResponsiveFullScreenDialog open={isOpen} onClose={onClose} aria-labelledby="delete-user-group-dialog">
            <DialogTitle id="delete-user-group-dialog-title">Gruppe löschen</DialogTitle>
            <DialogContent>
                {error && (
                    <p style={{ color: 'red' }}>{error.message}</p>
                )}
                <DialogContentText>
                    Möchtest du die Nutzergruppe "{group.name}" wirklich löschen? Sie ist dann unwiederbringlich verloren.
                </DialogContentText>
                <DialogContentText>
                    Beiträge und Kategorien, die <em>ausschließlich</em> für diese Gruppe sichtbar waren, werden dann öffentlich sichtbar.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    color={'primary'}
                    onClick={e => onClose(e, 'auto')}
                    disabled={isLoading}
                >
                    Abbrechen
                </Button>
                <Button
                    color={'secondary'}
                    onClick={() => deleteUserGroup({ variables: { id: group.id } })}
                    disabled={isLoading}
                >
                    Gruppe endgültig löschen
                </Button>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});