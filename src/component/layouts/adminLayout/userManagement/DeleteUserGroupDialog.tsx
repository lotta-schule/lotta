import React, { memo } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    Button,
    DialogActions,
} from '@material-ui/core';
import { TenantModel, UserGroupModel, ID } from 'model';
import { useMutation } from '@apollo/client';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { ErrorMessage } from 'component/general/ErrorMessage';
import DeleteUserGroupMutation from 'api/mutation/DeleteUserGroupMutation.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

export interface DeleteUserGroupDialogProps {
    isOpen: boolean;
    group: UserGroupModel;
    onClose(
        event: {},
        reason: 'backdropClick' | 'escapeKeyDown' | 'auto'
    ): void;
    onConfirm(): void;
}

export const DeleteUserGroupDialog = memo<DeleteUserGroupDialogProps>(
    ({ isOpen, group, onClose, onConfirm }) => {
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
            <ResponsiveFullScreenDialog
                open={isOpen}
                onClose={onClose}
                aria-labelledby="delete-user-group-dialog"
            >
                <DialogTitle id="delete-user-group-dialog-title">
                    Gruppe löschen
                </DialogTitle>
                <DialogContent>
                    <ErrorMessage error={error} />
                    <DialogContentText>
                        Möchtest du die Nutzergruppe "{group.name}" wirklich
                        löschen? Sie ist dann unwiederbringlich verloren.
                    </DialogContentText>
                    <DialogContentText>
                        Beiträge und Kategorien, die <em>ausschließlich</em> für
                        diese Gruppe sichtbar waren, werden dann öffentlich
                        sichtbar.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color={'primary'}
                        onClick={(e) => onClose(e, 'auto')}
                        disabled={isLoading}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        color={'secondary'}
                        onClick={() =>
                            deleteUserGroup({ variables: { id: group.id } })
                        }
                        disabled={isLoading}
                    >
                        Gruppe endgültig löschen
                    </Button>
                </DialogActions>
            </ResponsiveFullScreenDialog>
        );
    }
);
