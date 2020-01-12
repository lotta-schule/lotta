import React, { FunctionComponent, memo } from 'react';
import {
    DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, CircularProgress, Theme, makeStyles, Divider
} from '@material-ui/core';
import { ID, UserModel } from 'model';
import { UserAvatar } from 'component/user/UserAvatar';
import { GetUserQuery } from 'api/query/GetUserQuery';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { GroupSelect } from 'component/edit/GroupSelect';
import { SetUserGroupsMutation } from 'api/mutation/SetUserGroupsMutation';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { useTenant } from 'util/client/useTenant';
import { SetUserBlockedMutation } from 'api/mutation/SetUserBlockedMutation';
import { Block } from '@material-ui/icons';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
    header: {
        marginBottom: theme.spacing(3),
    },
    margin: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    blockButton: {
        marginTop: theme.spacing(3)
    },
    enableBlockButton: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
    },
    disableBlockButton: {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
    }
}));

export interface AssignUserToGroupsDialogProps {
    user: UserModel;
    onClose(): void;
}

export const AssignUserToGroupsDialog: FunctionComponent<AssignUserToGroupsDialogProps> = memo(({ user, onClose }) => {
    const styles = useStyles();
    const tenant = useTenant();

    const { data, loading, error } = useQuery<{ user: UserModel }, { id: ID }>(GetUserQuery, {
        variables: { id: user.id },
        fetchPolicy: 'network-only',
    });
    const [setUserGroups, { loading: setUserGroupsLoading, error: setUserGroupsError }] = useMutation<{ user: UserModel }, { id: ID, groupIds: ID[] }>(SetUserGroupsMutation);
    const [setUserBlocked, { loading: setUserBlockedLoading, error: setUserBlockedError }] = useMutation<{ user: UserModel }, { id: ID, isBlocked: boolean }>(SetUserBlockedMutation);

    return (
        <ResponsiveFullScreenDialog open={true} fullWidth>
            <DialogTitle>{user.name}s Details</DialogTitle>
            <DialogContent>
                <ErrorMessage error={error || setUserGroupsError || setUserBlockedError} />
                <Grid container justify={'space-evenly'} className={styles.header}>
                    <Grid item xs={3}>
                        <UserAvatar user={user} />
                    </Grid>
                    <Grid item xs={9}>
                        <Typography variant="h6">
                            {(data?.user ?? user).isBlocked && <Block color={'error'} />}
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
                    <>
                        <Divider />
                        <section>
                            <GroupSelect
                                row
                                hidePublicGroupSelection
                                disableAdminGroupsExclusivity
                                className={styles.margin}
                                selectedGroups={data.user.groups}
                                onSelectGroups={groups => setUserGroups({ variables: { id: user.id, groupIds: groups.map(g => g.id) } })}
                                disabled={setUserGroupsLoading}
                                label={'Gruppe zuweisen'}
                            />
                        </section>
                        <Divider />
                        <section>
                            {data.user.isBlocked && (
                                <Button
                                    className={clsx(styles.blockButton, styles.disableBlockButton)}
                                    disabled={setUserBlockedLoading}
                                    onClick={() => setUserBlocked({ variables: { id: data.user.id, isBlocked: false } })}
                                >
                                    Nutzer ist gesperrt. Nutzer wieder freischalten.
                                </Button>
                            )}
                            {!data.user.isBlocked && (
                                <>
                                    <Button
                                        className={clsx(styles.blockButton, styles.enableBlockButton)}
                                        disabled={setUserBlockedLoading}
                                        onClick={() => setUserBlocked({ variables: { id: data.user.id, isBlocked: true } })}
                                    >
                                        Nutzer sperren
                                    </Button>
                                    <Typography variant={'subtitle2'}>
                                        Ein gesperrter Nutzer wird abgemeldet und kann sich nicht mehr auf der Seite von "{tenant!.title}" anmelden.
                                    </Typography>
                                </>
                            )}
                        </section>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => onClose()}
                    color="secondary"
                    variant="outlined"
                >
                    Abbrechen
                </Button>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});