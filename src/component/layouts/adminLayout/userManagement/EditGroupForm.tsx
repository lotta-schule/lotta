import * as React from 'react';
import { UserGroupModel, ID, UserGroupInputModel } from 'model';
import { useUserGroups } from 'util/tenant/useUserGroups';
import {
    CircularProgress,
    Checkbox,
    FormControl,
    Input,
    InputLabel,
    FormHelperText,
    FormControlLabel,
    Button,
    Typography,
    makeStyles,
} from '@material-ui/core';
import { useQuery, useMutation } from '@apollo/client';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { DeleteUserGroupDialog } from './DeleteUserGroupDialog';
import { EnrollmentTokensEditor } from 'component/layouts/EnrollmentTokensEditor';
import UpdateUserGroupMutation from 'api/mutation/UpdateUserGroupMutation.graphql';
import GetGroupQuery from 'api/query/GetGroupQuery.graphql';

export interface EditGroupFormProps {
    group: UserGroupModel;
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    saveButton: {
        alignSelf: 'flex-end',
    },
    deleteButton: {
        alignSelf: 'flex-start',
        backgroundColor: theme.palette.error.main,
        color: theme.palette.getContrastText(theme.palette.error.main),
    },
}));

export const EditGroupForm = React.memo<EditGroupFormProps>(({ group }) => {
    const styles = useStyles();
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
                <InputLabel htmlFor="group-name">Gruppenname</InputLabel>
                <Input
                    id="group-name"
                    aria-describedby="group-name-help-text"
                    disabled={isLoadingUpdateGroup}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                <FormHelperText id="group-name-help-text">
                    Gib der Gruppe einen verständlichen Namen
                </FormHelperText>
            </FormControl>
            <FormControl>
                <FormControlLabel
                    control={<Checkbox />}
                    disabled={isLoadingUpdateGroup || isSoleAdminGroup}
                    label={'Diese Gruppe hat universelle Administratorrechte'}
                    checked={!!group.isAdminGroup}
                    onChange={(_, checked) => {
                        updateGroup({
                            variables: {
                                id: group.id,
                                group: {
                                    name,
                                    enrollmentTokens,
                                    isAdminGroup: checked,
                                },
                            },
                        });
                    }}
                />
            </FormControl>
            <Typography variant={'caption'}>Einschreibeschlüssel</Typography>
            <Typography variant={'body2'}>
                Nutzer, die bei der Registrierung einen
                Einschreibeschlüsselverwenden, werden automatisch dieser Gruppe
                zugeordnet.
            </Typography>
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
                        variant={'contained'}
                        size={'small'}
                        onClick={() => setIsDeleteUserGroupDialogOpen(true)}
                    >
                        Gruppe "{group.name}" löschen
                    </Button>
                    <DeleteUserGroupDialog
                        isOpen={isDeleteUserGroupDialogOpen}
                        group={group}
                        onClose={() => setIsDeleteUserGroupDialogOpen(false)}
                        onConfirm={() => setIsDeleteUserGroupDialogOpen(false)}
                    />
                </>
            )}
        </form>
    );
});
