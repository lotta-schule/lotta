import React, { Fragment, FunctionComponent, memo } from 'react';
import {
    DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, CircularProgress, Theme, makeStyles, Divider
} from '@material-ui/core';
import { ID, UserModel } from 'model';
import { UserAvatar } from 'component/user/UserAvatar';
import { GetUserQuery } from 'api/query/GetUserQuery';
import { useQuery, useMutation } from '@apollo/client';
import { GroupSelect } from 'component/edit/GroupSelect';
import { SetUserGroupsMutation } from 'api/mutation/SetUserGroupsMutation';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { useSystem } from 'util/client/useSystem';
import { SetUserBlockedMutation } from 'api/mutation/SetUserBlockedMutation';
import { Block } from '@material-ui/icons';
import clsx from 'clsx';
import { useUserGroups } from 'util/client/useUserGroups';

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

export interface EditUserPermissionsDialogProps {
    user: UserModel;
    onClose(): void;
}

export const EditUserPermissionsDialog: FunctionComponent<EditUserPermissionsDialogProps> = memo(({ user, onClose }) => {
    const styles = useStyles();
    const system = useSystem();
    const allUserGroups = useUserGroups();

    const { data, loading, error } = useQuery<{ user: UserModel }, { id: ID }>(GetUserQuery, {
        variables: { id: user.id },
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first'
    });
    const [setUserGroups, { error: setUserGroupsError }] = useMutation<{ user: UserModel }, { id: ID, groupIds: ID[] }>(
        SetUserGroupsMutation, {
            optimisticResponse: ({ id, groupIds }) => ({
                __typename: 'Mutation',
                user: {
                    __typename: 'User',
                    id,
                    groups: data?.user.groups.map(group => ({ ...group, __typename: 'UserGroup' })),
                    assignedGroups: allUserGroups.filter(group => groupIds.indexOf(group.id) > -1).map(group => ({ id: group.id, name: group.name, __typename: 'UserGroup' }))
                }
            } as any)
        }
    );
    const [setUserBlocked, { loading: setUserBlockedLoading, error: setUserBlockedError }] = useMutation<{ user: UserModel }, { id: ID, isBlocked: boolean }>(
        SetUserBlockedMutation, {
            optimisticResponse: ({ id, isBlocked }) => ({
                __typename: 'Mutation',
                user: {
                    __typename: 'User',
                    id,
                    isBlocked
                }
            } as any),
            variables: { id: user.id, isBlocked: !data?.user.isBlocked }
        }
    );

    const dynamicGroups = data && data.user.groups.filter(group => !(data.user.assignedGroups ?? []).find(assignedGroup => assignedGroup.id === group.id))

    return (
        <ResponsiveFullScreenDialog open={true} fullWidth>
            <DialogTitle data-testid="DialogTitle">{user.name}s Details</DialogTitle>
            <DialogContent>
                <ErrorMessage error={error || setUserGroupsError || setUserBlockedError} />
                <Grid container justify={'space-evenly'} className={styles.header}>
                    <Grid item xs={3}>
                        <UserAvatar user={user} size={200} />
                    </Grid>
                    <Grid item xs={9}>
                        <Typography variant="h6" data-testid="UserName">
                            {(data?.user ?? user).isBlocked && <Block color={'error'} data-testid="UserBlockedIcon" />}
                            {user.name}
                        </Typography>
                        {user.nickname && (
                            <Typography variant="body2" data-testid="UserNickname">
                                <strong>{user.nickname}</strong>
                            </Typography>
                        )}
                        <Typography variant="body1" data-testid="UserEmail">
                            {user.email}
                        </Typography>
                        {user.class && (
                            <Typography variant="body2" data-testid="UserClass">
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
                        <section data-testid="GroupSelectSection">
                            <GroupSelect
                                row
                                hidePublicGroupSelection
                                disableAdminGroupsExclusivity
                                className={styles.margin}
                                selectedGroups={data.user?.assignedGroups ?? []}
                                onSelectGroups={groups => setUserGroups({ variables: { id: user.id, groupIds: groups.map(g => g.id) } })}
                                label={'Gruppe zuweisen'}
                            />
                        </section>
                        {dynamicGroups && (
                            <span data-testid="DynamicGroups">
                                Über Einschreibeschlüssel zugewiesene Gruppen:
                              {dynamicGroups.map((group, i, arr) => (
                                <Fragment key={group.id}>
                                  <em>{group.name}</em>
                                  {i !== arr.length - 1 && (<>, </>)}
                                </Fragment>
                              ))}
                            </span>
                        )}
                        <Divider />
                        <section>
                            {data.user.isBlocked && (
                                <Button
                                    data-testid="BlockButton"
                                    className={clsx(styles.blockButton, styles.disableBlockButton)}
                                    disabled={setUserBlockedLoading}
                                    onClick={() => setUserBlocked()}
                                >
                                    Nutzer ist gesperrt. Nutzer wieder freischalten.
                                </Button>
                            )}
                            {!data.user.isBlocked && (
                                <>
                                    <Button
                                        data-testid="BlockButton"
                                        className={clsx(styles.blockButton, styles.enableBlockButton)}
                                        disabled={setUserBlockedLoading}
                                        onClick={() => setUserBlocked()}
                                    >
                                        Nutzer sperren
                                    </Button>
                                    <Typography variant={'subtitle2'}>
                                        Ein gesperrter Nutzer wird abgemeldet und kann sich nicht mehr auf der Seite von "{system!.title}" anmelden.
                                    </Typography>
                                </>
                            )}
                        </section>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    data-testid="AbortButton"
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
