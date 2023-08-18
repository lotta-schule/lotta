import * as React from 'react';
import { useMutation } from '@apollo/client';
import { UserGroupModel, ID } from 'model';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    ErrorMessage,
} from '@lotta-schule/hubert';

import GetUserGroupsQuery from 'api/query/GetUserGroupsQuery.graphql';
import DeleteUserGroupMutation from 'api/mutation/DeleteUserGroupMutation.graphql';

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
                    const readUserGroupsResult = cache.readQuery<{
                        userGroups: UserGroupModel[];
                    }>({ query: GetUserGroupsQuery });
                    cache.writeQuery<{ userGroups: UserGroupModel[] }>({
                        query: GetUserGroupsQuery,
                        data: {
                            userGroups: (
                                readUserGroupsResult?.userGroups ?? []
                            ).filter((g) => g.id !== data.group.id),
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
