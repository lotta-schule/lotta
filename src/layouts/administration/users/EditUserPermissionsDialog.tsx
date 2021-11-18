import * as React from 'react';
import { Grid, CircularProgress } from '@material-ui/core';
import { useQuery, useMutation } from '@apollo/client';
import { ID, UserModel } from 'model';
import { Button } from 'component/general/button/Button';
import {
    Dialog,
    DialogActions,
    DialogContent,
} from 'component/general/dialog/Dialog';
import { Divider } from 'component/general/divider/Divider';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { GroupSelect } from 'component/edit/GroupSelect';
import { UserAvatar } from 'component/user/UserAvatar';
import { useUserGroups } from 'util/tenant/useUserGroups';

import UpdateUserMutation from 'api/mutation/UpdateUserMutation.graphql';
import GetUserQuery from 'api/query/GetUserQuery.graphql';

import styles from './EditUserPermissionDialog.module.scss';

export interface EditUserPermissionsDialogProps {
    user: UserModel;
    onRequestClose(): void;
}

export const EditUserPermissionsDialog =
    React.memo<EditUserPermissionsDialogProps>(({ user, onRequestClose }) => {
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
            <Dialog
                open={true}
                onRequestClose={onRequestClose}
                className={styles.root}
                title={`${user.name}s Details`}
            >
                <DialogContent>
                    <ErrorMessage error={error || updateUserError} />
                    <Grid
                        container
                        justifyContent={'space-evenly'}
                        className={styles.header}
                    >
                        <Grid item xs={3}>
                            <UserAvatar user={user} size={100} />
                        </Grid>
                        <Grid item xs={9}>
                            <h6 data-testid="UserName">{user.name}</h6>
                            {user.nickname && (
                                <p data-testid="UserNickname">
                                    <strong>{user.nickname}</strong>
                                </p>
                            )}
                            <p data-testid="UserEmail">{user.email}</p>
                            {user.class && (
                                <p data-testid="UserClass">
                                    Klasse: {user.class}
                                </p>
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
                                        <React.Fragment key={group.id}>
                                            <em>{group.name}</em>
                                            {i !== arr.length - 1 && <>, </>}
                                        </React.Fragment>
                                    ))}
                                </span>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        data-testid="AbortButton"
                        onClick={() => onRequestClose()}
                    >
                        Abbrechen
                    </Button>
                </DialogActions>
            </Dialog>
        );
    });
