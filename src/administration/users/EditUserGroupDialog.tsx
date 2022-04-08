import * as React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { UserGroupModel, ID, UserGroupInputModel } from 'model';
import { Dialog } from 'shared/general/dialog/Dialog';
import { useUserGroups } from 'util/tenant/useUserGroups';
import { Button } from 'shared/general/button/Button';
import { Checkbox } from 'shared/general/form/checkbox';
import { EnrollmentTokensEditor } from 'profile/component/EnrollmentTokensEditor';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { Input } from 'shared/general/form/input/Input';
import { Label } from 'shared/general/label/Label';
import { LinearProgress } from 'shared/general/progress/LinearProgress';
import { DeleteUserGroupDialog } from './DeleteUserGroupDialog';

import UpdateUserGroupMutation from 'api/mutation/UpdateUserGroupMutation.graphql';
import GetGroupQuery from 'api/query/GetGroupQuery.graphql';

import styles from './EditUserGroupDialog.module.scss';

export interface EditUserGroupDialogProps {
    group: UserGroupModel | null;
    onRequestClose: () => void;
}

export const EditUserGroupDialog = React.memo<EditUserGroupDialogProps>(
    ({ group, onRequestClose }) => {
        const groups = useUserGroups();

        const [name, setName] = React.useState(group?.name ?? '');

        const [isDeleteUserGroupDialogOpen, setIsDeleteUserGroupDialogOpen] =
            React.useState(false);

        const {
            data,
            loading: isLoading,
            error: loadDetailsError,
        } = useQuery<{ group: UserGroupModel }, { id: ID }>(GetGroupQuery, {
            variables: {
                id: group?.id!,
            },
            skip: !group,
        });
        const [
            updateGroup,
            { loading: isLoadingUpdateGroup, error: updateError },
        ] = useMutation<
            { group: UserGroupModel },
            { id: ID; group: UserGroupInputModel }
        >(UpdateUserGroupMutation);

        React.useEffect(() => {
            if (data?.group) {
                setName(data.group.name);
            }
        }, [data]);

        const isSoleAdminGroup =
            data?.group.isAdminGroup &&
            groups.filter((g) => g.isAdminGroup).length < 2;
        const enrollmentTokens =
            data?.group.enrollmentTokens?.map((t) => t.token) ?? [];

        return (
            <Dialog
                open={!!group}
                onRequestClose={onRequestClose}
                title={`Gruppe "${group?.name}" bearbeiten`}
            >
                {isLoading && <LinearProgress isIndeterminate />}
                {group && (
                    <form
                        className={styles.root}
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <ErrorMessage error={loadDetailsError || updateError} />
                        <div>
                            <Label label={'Gruppenname'}>
                                <Input
                                    id="group-name"
                                    aria-describedby="group-name-help-text"
                                    disabled={isLoadingUpdateGroup}
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.currentTarget.value)
                                    }
                                    onBlur={() => {
                                        updateGroup({
                                            variables: {
                                                id: group.id,
                                                group: {
                                                    isAdminGroup:
                                                        group.isAdminGroup,
                                                    enrollmentTokens,
                                                    name,
                                                },
                                            },
                                        });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            updateGroup({
                                                variables: {
                                                    id: group.id,
                                                    group: {
                                                        isAdminGroup:
                                                            group.isAdminGroup,
                                                        enrollmentTokens,
                                                        name,
                                                    },
                                                },
                                            });
                                        }
                                    }}
                                />
                            </Label>
                            <small id="group-name-help-text">
                                Gib der Gruppe einen verständlichen Namen
                            </small>
                        </div>
                        <Checkbox
                            isDisabled={
                                isLoadingUpdateGroup || isSoleAdminGroup
                            }
                            isSelected={!!group.isAdminGroup}
                            onChange={(isSelected) => {
                                updateGroup({
                                    variables: {
                                        id: group.id,
                                        group: {
                                            name,
                                            enrollmentTokens,
                                            isAdminGroup: isSelected,
                                        },
                                    },
                                });
                            }}
                        >
                            Diese Gruppe hat universelle Administratorrechte
                        </Checkbox>
                        <p>Einschreibeschlüssel</p>
                        <p>
                            Nutzer, die bei der Registrierung einen
                            Einschreibeschlüsselverwenden, werden automatisch
                            dieser Gruppe zugeordnet.
                        </p>
                        <EnrollmentTokensEditor
                            disabled={isLoadingUpdateGroup}
                            tokens={enrollmentTokens}
                            setTokens={(enrollmentTokens) => {
                                updateGroup({
                                    variables: {
                                        id: group.id,
                                        group: {
                                            isAdminGroup: group.isAdminGroup,
                                            enrollmentTokens,
                                            name,
                                        },
                                    },
                                });
                            }}
                        />
                        {!isSoleAdminGroup && (
                            <>
                                <Button
                                    className={styles.deleteButton}
                                    onClick={() =>
                                        setIsDeleteUserGroupDialogOpen(true)
                                    }
                                >
                                    Gruppe "{group.name}" löschen
                                </Button>
                                <DeleteUserGroupDialog
                                    isOpen={isDeleteUserGroupDialogOpen}
                                    group={group}
                                    onRequestClose={() =>
                                        setIsDeleteUserGroupDialogOpen(false)
                                    }
                                    onConfirm={() =>
                                        setIsDeleteUserGroupDialogOpen(false)
                                    }
                                />
                            </>
                        )}
                    </form>
                )}
            </Dialog>
        );
    }
);
EditUserGroupDialog.displayName = 'AdministrationEditUserGroupDialog';
