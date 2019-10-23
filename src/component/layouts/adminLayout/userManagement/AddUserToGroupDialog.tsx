import React, { FunctionComponent, memo, useState, useEffect, useCallback, FormEvent } from 'react';
import {
    DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Select,
    FormControl, Input, MenuItem, FormHelperText, Typography, Grid, CircularProgress, Theme, makeStyles,
} from '@material-ui/core';
import { UserModel } from 'model';
import { UserAvatar } from 'component/user/UserAvatar';
import { useUserGroups } from 'util/client/useUserGroups';
import { GetUserQuery } from 'api/query/GetUserQuery';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';
import { find } from 'lodash';
import { AssignUserToGroupMutation } from 'api/mutation/AssignUserToGroupMutation';
import { ID } from 'model/ID';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';

const useStyles = makeStyles((theme: Theme) => ({
    margin: {
        marginBottom: theme.spacing(2),
    }
}));

export interface AddUserToGroupDialogProps {
    user: UserModel;
    onConfirm(user: UserModel): void;
    onAbort(): void;
}

export const AddUserToGroupDialog: FunctionComponent<AddUserToGroupDialogProps> = memo(({ user, onConfirm, onAbort }) => {
    const styles = useStyles();
    const userGroups = useUserGroups();
    const [selectedGroupId, setSelectedGroupId] = useState<ID | null | undefined>(undefined);
    const [loadUser, { data, loading, error }] = useLazyQuery<{ user: UserModel }, { id: ID }>(GetUserQuery, { fetchPolicy: 'no-cache' });
    const [assignUser, { data: assignUserData, loading: assignUserLoading, error: assignUserError }] = useMutation<{ user: UserModel }, { id: ID, groupId: ID }>(AssignUserToGroupMutation);

    const onSubmitForm = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (user && selectedGroupId) {
            assignUser({ variables: { id: user.id, groupId: selectedGroupId }, fetchPolicy: 'no-cache' });
        }
    }, [assignUser, selectedGroupId, user]);

    useEffect(() => {
        if (user) {
            if (data && data.user) {
                const group = data.user.groups.find(g => Boolean(find(userGroups, { id: g.id }))) || null;
                if (group && !selectedGroupId) {
                    setSelectedGroupId(group.id);
                }
            } else {
                loadUser({ variables: { id: user && user.id } });
            }
        } else if (selectedGroupId) {
            setSelectedGroupId(null);
        }
    }, [loadUser, selectedGroupId, user, data, userGroups]);

    if (assignUserData && assignUserData.user) {
        onConfirm(assignUserData.user);
        return null;
    }

    return (
        <ResponsiveFullScreenDialog open={true} fullWidth>
            <form onSubmit={onSubmitForm}>
                <DialogTitle>{user.name} eine Gruppe zuweisen</DialogTitle>
                <DialogContent>
                    <DialogContentText variant="body2">
                        Weise dem Nutzer eine Gruppe mit den dazugehörigen Rechten zu.
                    </DialogContentText>
                    {(error || assignUserError) && (
                        <p style={{ color: 'red' }}>{error || assignUserError}</p>
                    )}
                    <Grid container justify={'space-evenly'}>
                        <Grid item xs={3}>
                            <UserAvatar user={user} />
                        </Grid>
                        <Grid item xs={9}>
                            <Typography variant="h6">
                                {user.name}
                            </Typography>
                            <Typography variant="body2">
                                {user.nickname}
                            </Typography>
                            {user.class && (
                                <Typography variant="body2">
                                    Klasse: {user.class}
                                </Typography>
                            )}
                            <Typography variant="body2">
                                E-Mail-Aresse: {user.email}
                            </Typography>
                        </Grid>
                    </Grid>
                    {loading && (
                        <CircularProgress />
                    )}
                    {!loading && (
                        <FormControl fullWidth className={styles.margin}>
                            <Select
                                value={selectedGroupId || undefined}
                                onChange={({ target }) => {
                                    setSelectedGroupId(target.value as ID);
                                }}
                                input={<Input name="group-id" id="group-id-placeholder" />}
                                fullWidth
                                name="group-id"
                                placeholder="Keine Gruppe"
                            >
                                {userGroups.map(group => (
                                    <MenuItem key={group.id} value={group.id}>
                                        {group.name}
                                    </MenuItem>
                                ))}
                                <MenuItem value={undefined}>
                                    <em>Keine Gruppe</em>
                                </MenuItem>
                            </Select>
                            <FormHelperText>Gruppe auswählen</FormHelperText>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            onAbort();
                        }}
                        color="secondary"
                        variant="outlined"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type={'submit'}
                        disabled={assignUserLoading}
                        color={'secondary'}
                        variant={'contained'}
                        onClick={() => { }}
                    >
                        Gruppe zuweisen
                </Button>
                </DialogActions>
            </form>
        </ResponsiveFullScreenDialog>
    );
});