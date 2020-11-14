import * as React from 'react';
import { UserGroupModel, ID, UserGroupInputModel } from 'model';
import { useUserGroups } from 'util/client/useUserGroups';
import {
    CircularProgress, Checkbox, FormControl, Input, InputLabel, FormHelperText, FormControlLabel, Button, Typography, makeStyles
} from '@material-ui/core';
import { useQuery, useMutation } from '@apollo/client';
import { GetGroupQuery } from 'api/query/GetGroupQuery';
import { UpdateUserGroupMutation } from 'api/mutation/UpdateUserGroupMutation';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { DeleteUserGroupDialog } from './DeleteUserGroupDialog';
import { EnrollmentTokensEditor } from 'component/layouts/EnrollmentTokensEditor';

export interface EditGroupFormProps {
    group: UserGroupModel;
}

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
    },
    saveButton: {
        alignSelf: 'flex-end'
    },
    deleteButton: {
        alignSelf: 'flex-start',
        backgroundColor: theme.palette.error.main,
        color: theme.palette.getContrastText(theme.palette.error.main)
    },
}));

export const EditGroupForm = React.memo<EditGroupFormProps>(({ group }) => {
    const styles = useStyles();
    const groups = useUserGroups();

    const [name, setName] = React.useState(group.name);
    const [isAdminGroup, setIsAdminGroup] = React.useState(group.isAdminGroup);
    const [enrollmentTokens, setEnrollmentTokens] = React.useState((group.enrollmentTokens || []).map(t => t.token));

    const [isDeleteUserGroupDialogOpen, setIsDeleteUserGroupDialogOpen] = React.useState(false);

    const { data, loading: isLoading, error: loadDetailsError } = useQuery<{ group: UserGroupModel }, { id: ID }>(GetGroupQuery, {
        variables: {
            id: group.id
        }
    });
    const [updateGroup, { loading: isLoadingUpdateGroup, error: updateError }] = useMutation<{ group: UserGroupModel }, { id: ID, group: UserGroupInputModel }>(UpdateUserGroupMutation);

    React.useEffect(() => {
        if (data && data.group) {
            setName(data.group.name);
            setIsAdminGroup(data.group.isAdminGroup);
            setEnrollmentTokens(data.group.enrollmentTokens.map(t => t.token));
        }
    }, [data]);

    if (isLoading) {
        return (
            <CircularProgress />
        );
    }

    const isSoleAdminGroup = isAdminGroup && groups.filter(g => g.isAdminGroup).length < 2;

    return (
        <form className={styles.root} onSubmit={e => {
            e.preventDefault();
            updateGroup({
                variables: {
                    id: group.id,
                    group: { name, isAdminGroup, enrollmentTokens }
                }
            })
        }}>
            <ErrorMessage error={loadDetailsError || updateError} />
            <FormControl>
                <InputLabel htmlFor="group-name">Gruppenname</InputLabel>
                <Input
                    id="group-name"
                    aria-describedby="group-name-help-text"
                    disabled={isLoadingUpdateGroup}
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <FormHelperText id="group-name-help-text">Gib der Gruppe einen verständlichen Namen</FormHelperText>
            </FormControl>
            <FormControl>
                <FormControlLabel
                    control={<Checkbox />}
                    disabled={isLoadingUpdateGroup || isSoleAdminGroup}
                    label={'Diese Gruppe hat universelle Administratorrechte'}
                    checked={!!isAdminGroup}
                    onChange={(_, checked) => setIsAdminGroup(checked)}
                />
            </FormControl>
            <Typography variant={'caption'}>Einschreibeschlüssel</Typography>
            <Typography variant={'body2'}>
                Nutzer, die bei der Registrierung einen Einschreibeschlüsselverwenden, werden automatisch dieser Gruppe zugeordnet.
            </Typography>
            <EnrollmentTokensEditor
                disabled={isLoadingUpdateGroup}
                tokens={enrollmentTokens}
                setTokens={setEnrollmentTokens}
            />
            <Button
                className={styles.saveButton}
                variant={'contained'}
                color={'secondary'}
                type={'submit'}
            >
                Gruppe speichern
            </Button>
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
