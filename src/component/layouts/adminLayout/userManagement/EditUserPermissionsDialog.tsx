import React, { Fragment, FunctionComponent, memo } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    CircularProgress,
    Theme,
    makeStyles,
    Divider,
} from '@material-ui/core';
import { ID, UserModel } from 'model';
import { UserAvatar } from 'component/user/UserAvatar';
import { GetUserQuery } from 'api/query/GetUserQuery';
import { useQuery, useMutation } from '@apollo/client';
import { GroupSelect } from 'component/edit/GroupSelect';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { UpdateUserMutation } from 'api/mutation/UpdateUserMutation';
import { useUserGroups } from 'util/tenant/useUserGroups';

const useStyles = makeStyles((theme: Theme) => ({
    header: {
        marginBottom: theme.spacing(3),
    },
    margin: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
}));

export interface EditUserPermissionsDialogProps {
    user: UserModel;
    onClose(): void;
}

export const EditUserPermissionsDialog: FunctionComponent<EditUserPermissionsDialogProps> = memo(
    ({ user, onClose }) => {
        const styles = useStyles();
        const allUserGroups = useUserGroups();

        const { data, loading, error } = useQuery<
            { user: UserModel },
            { id: ID }
        >(GetUserQuery, {
            variables: { id: user.id },
            fetchPolicy: 'network-only',
            nextFetchPolicy: 'cache-first',
        });
        const [updateUser, { error: updateUserError }] = useMutation<
            { user: UserModel },
            { id: ID; groups?: { id: ID }[] }
        >(UpdateUserMutation, {
            optimisticResponse: ({ id, groups }) =>
                ({
                    __typename: 'Mutation',
                    user: {
                        __typename: 'User',
                        id,
                        ...(groups && {
                            groups: data?.user.groups.map((group) => ({
                                ...group,
                                __typename: 'UserGroup',
                            })),
                            assignedGroups: allUserGroups
                                .filter(
                                    (group) =>
                                        groups
                                            .map((g) => g.id)
                                            .indexOf(group.id) > -1
                                )
                                .map((group) => ({
                                    id: group.id,
                                    name: group.name,
                                    __typename: 'UserGroup',
                                })),
                        }),
                    },
                } as any),
        });

        const dynamicGroups =
            data &&
            data.user.groups.filter(
                (group) =>
                    !(data.user.assignedGroups ?? []).find(
                        (assignedGroup) => assignedGroup.id === group.id
                    )
            );

        return (
            <ResponsiveFullScreenDialog open={true} fullWidth>
                <DialogTitle data-testid="DialogTitle">
                    {user.name}s Details
                </DialogTitle>
                <DialogContent>
                    <ErrorMessage error={error || updateUserError} />
                    <Grid
                        container
                        justify={'space-evenly'}
                        className={styles.header}
                    >
                        <Grid item xs={3}>
                            <UserAvatar user={user} size={200} />
                        </Grid>
                        <Grid item xs={9}>
                            <Typography variant="h6" data-testid="UserName">
                                {user.name}
                            </Typography>
                            {user.nickname && (
                                <Typography
                                    variant="body2"
                                    data-testid="UserNickname"
                                >
                                    <strong>{user.nickname}</strong>
                                </Typography>
                            )}
                            <Typography variant="body1" data-testid="UserEmail">
                                {user.email}
                            </Typography>
                            {user.class && (
                                <Typography
                                    variant="body2"
                                    data-testid="UserClass"
                                >
                                    Klasse: {user.class}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                    {loading && <CircularProgress />}
                    {data && (
                        <>
                            <Divider />
                            <section data-testid="GroupSelectSection">
                                <GroupSelect
                                    row
                                    hidePublicGroupSelection
                                    disableAdminGroupsExclusivity
                                    className={styles.margin}
                                    selectedGroups={
                                        data.user?.assignedGroups ?? []
                                    }
                                    onSelectGroups={(groups) =>
                                        updateUser({
                                            variables: {
                                                id: user.id,
                                                groups: groups.map((g) => ({
                                                    id: g.id,
                                                })),
                                            },
                                        })
                                    }
                                    label={'Gruppe zuweisen'}
                                />
                            </section>
                            {dynamicGroups && (
                                <span data-testid="DynamicGroups">
                                    Über Einschreibeschlüssel zugewiesene
                                    Gruppen:
                                    {dynamicGroups.map((group, i, arr) => (
                                        <Fragment key={group.id}>
                                            <em>{group.name}</em>
                                            {i !== arr.length - 1 && <>, </>}
                                        </Fragment>
                                    ))}
                                </span>
                            )}
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
    }
);
