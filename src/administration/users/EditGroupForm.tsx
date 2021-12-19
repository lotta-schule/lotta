import * as React from 'react';
import {
    CircularProgress,
    FormControl,
    FormHelperText,
} from '@material-ui/core';
import { useQuery, useMutation } from '@apollo/client';
import { UserGroupModel, ID, UserGroupInputModel } from 'model';
import { useUserGroups } from 'util/tenant/useUserGroups';
import { Button } from 'shared/general/button/Button';
import { Checkbox } from 'shared/general/form/checkbox';
import { EnrollmentTokensEditor } from 'profile/component/EnrollmentTokensEditor';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { Input } from 'shared/general/form/input/Input';
import { Label } from 'shared/general/label/Label';
import { DeleteUserGroupDialog } from './DeleteUserGroupDialog';
import UpdateUserGroupMutation from 'api/mutation/UpdateUserGroupMutation.graphql';
import GetGroupQuery from 'api/query/GetGroupQuery.graphql';

import styles from './EditGroupForm.module.scss';

export interface EditGroupFormProps {
    group: UserGroupModel;
}

export const EditGroupForm = React.memo<EditGroupFormProps>(({ group }) => {
    const groups = useUserGroups();

    const [name, setName] = React.useState(group.name);

    const [isDeleteUserGroupDialogOpen, setIsDeleteUserGroupDialogOpen] =
        React.useState(false);

    const {
        data,
        loading: isLoading,
        error: loadDetailsError,
    } = useQuery<{ group: UserGroupModel }, { id: ID }>(GetGroupQuery, {
        variables: {
            id: group.id,
        },
    });
    const [updateGroup, { loading: isLoadingUpdateGroup, error: updateError }] =
        useMutation<
            { group: UserGroupModel },
            { id: ID; group: UserGroupInputModel }
        >(UpdateUserGroupMutation);

    React.useEffect(() => {
        if (data && data.group) {
            setName(data.group.name);
        }
    }, [data]);

    if (isLoading) {
        return <CircularProgress />;
    }

    const isSoleAdminGroup =
        data?.group.isAdminGroup &&
        groups.filter((g) => g.isAdminGroup).length < 2;
    const enrollmentTokens =
        data?.group.enrollmentTokens?.map((t) => t.token) ?? [];

    return (
        <form
            className={styles.root}
            onSubmit={(e) => {
                e.preventDefault();
            }}
        >
            <ErrorMessage error={loadDetailsError || updateError} />
            <FormControl>
                <Label label={'Gruppenname'}>
                    <Input
                        id="group-name"
                        aria-describedby="group-name-help-text"
                        disabled={isLoadingUpdateGroup}
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                        onBlur={() => {
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
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
                            }
                        }}
                    />
                </Label>
                <FormHelperText id="group-name-help-text">
                    Gib der Gruppe einen verständlichen Namen
                </FormHelperText>
            </FormControl>
            <Checkbox
                isDisabled={isLoadingUpdateGroup || isSoleAdminGroup}
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
                Einschreibeschlüsselverwenden, werden automatisch dieser Gruppe
                zugeordnet.
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
                        onClick={() => setIsDeleteUserGroupDialogOpen(true)}
                    >
                        Gruppe "{group.name}" löschen
                    </Button>
                    <DeleteUserGroupDialog
                        isOpen={isDeleteUserGroupDialogOpen}
                        group={group}
                        onRequestClose={() =>
                            setIsDeleteUserGroupDialogOpen(false)
                        }
                        onConfirm={() => setIsDeleteUserGroupDialogOpen(false)}
                    />
                </>
            )}
        </form>
    );
});
EditGroupForm.displayName = 'AdministrationEditGroupForm';
