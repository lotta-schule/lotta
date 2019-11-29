import React, { FunctionComponent, memo, useState, useCallback, FormEvent } from 'react';
import {
    DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, Grid, CircularProgress, Theme, makeStyles,
} from '@material-ui/core';
import { UserModel } from 'model';
import { UserAvatar } from 'component/user/UserAvatar';
import { useUserGroups } from 'util/client/useUserGroups';
import { GetUserQuery } from 'api/query/GetUserQuery';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { find } from 'lodash';
import { GroupSelect } from 'component/edit/GroupSelect';
import { SetUserGroupsMutation } from 'api/mutation/SetUserGroupsMutation';
import { ID, UserGroupModel } from 'model';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';

const useStyles = makeStyles((theme: Theme) => ({
    margin: {
        marginBottom: theme.spacing(2),
    }
}));

export interface AssignUserToGroupsDialogProps {
    user: UserModel;
    onConfirm(user: UserModel): void;
    onAbort(): void;
}

export const AssignUserToGroupsDialog: FunctionComponent<AssignUserToGroupsDialogProps> = memo(({ user, onConfirm, onAbort }) => {
    const styles = useStyles();
    const userGroups = useUserGroups();
    const [selectedGroups, setSelectedGroups] = useState<UserGroupModel[]>([]);
    const { data, loading, error } = useQuery<{ user: UserModel }, { id: ID }>(GetUserQuery, {
        variables: { id: user.id },
        fetchPolicy: 'network-only',
        onCompleted: ({ user }) => setSelectedGroups(user.groups.filter(g => !!find(userGroups, { id: g.id })))
    });
    const [setUserGroups, { data: setUserGroupsData, loading: setUserGroupsLoading, error: setUserGroupsError }] = useMutation<{ user: UserModel }, { id: ID, groupIds: ID[] }>(SetUserGroupsMutation);

    const onSubmitForm = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (user) {
            setUserGroups({ variables: { id: user.id, groupIds: selectedGroups.map(g => g.id) } });
        }
    }, [setUserGroups, selectedGroups, user]);

    if (setUserGroupsData && setUserGroupsData.user) {
        onConfirm(setUserGroupsData.user);
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
                    {(error || setUserGroupsError) && (
                        <p style={{ color: 'red' }}>{error ? error.message : setUserGroupsError!.message}</p>
                    )}
                    <Grid container justify={'space-evenly'}>
                        <Grid item xs={3}>
                            <UserAvatar user={user} />
                        </Grid>
                        <Grid item xs={9}>
                            <Typography variant="h6">
                                {user.name}
                            </Typography>
                            {user.nickname && (
                                <Typography variant="body2">
                                    <strong>{user.nickname}</strong>
                                </Typography>
                            )}
                            <Typography variant="body1">
                                {user.email}
                            </Typography>
                            {user.class && (
                                <Typography variant="body2">
                                    Klasse: {user.class}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                    {loading && (
                        <CircularProgress />
                    )}
                    {data && (
                        <GroupSelect
                            hidePublicGroupSelection
                            disableAdminGroupsExclusivity
                            className={styles.margin}
                            selectedGroups={selectedGroups}
                            onSelectGroups={setSelectedGroups}
                        />
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
                        disabled={setUserGroupsLoading}
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