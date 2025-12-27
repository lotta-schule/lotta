import * as React from 'react';
import { skipToken, useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { ID, UserGroupModel, UserModel } from 'model';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  ErrorMessage,
  LinearProgress,
  LoadingButton,
} from '@lotta-schule/hubert';
import { GroupSelect } from 'shared/edit/GroupSelect';
import { UserAvatar } from 'shared/userAvatar/UserAvatar';
import { DeleteUserDialog } from './DeleteUserDialog';

import UpdateUserMutation from 'api/mutation/UpdateUserMutation.graphql';
import GetUserQuery from 'api/query/GetUserQuery.graphql';

import styles from './EditUserPermissionDialog.module.scss';

export interface EditUserPermissionsDialogProps {
  selectedUser: UserModel | null;
  onRequestClose(): void;
}

export const EditUserPermissionsDialog = React.memo(
  ({ selectedUser, onRequestClose }: EditUserPermissionsDialogProps) => {
    const { t } = useTranslation();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [assignedUserRoles, setAssignedUserRoles] = React.useState<
      UserGroupModel[]
    >([]);

    const { data, loading, error } = useQuery<{ user: UserModel }, { id: ID }>(
      GetUserQuery,
      selectedUser
        ? {
            variables: { id: selectedUser.id },
            fetchPolicy: 'network-only',
            nextFetchPolicy: 'cache-first',
          }
        : skipToken
    );

    React.useEffect(() => {
      if (data?.user) {
        setAssignedUserRoles(data.user.assignedGroups ?? []);
      }
    }, [data]);

    const [updateUser, { error: updateUserError }] = useMutation<
      { user: UserModel },
      { id: ID; groups?: { id: ID }[] }
    >(UpdateUserMutation);

    const dynamicGroups = React.useMemo(
      () =>
        data?.user?.groups?.filter(
          (group) =>
            !(data.user?.assignedGroups ?? []).find(
              (assignedGroup) => assignedGroup?.id === group?.id
            )
        ) ?? [],
      [data]
    );

    return (
      <>
        <Dialog
          open={!!selectedUser}
          onRequestClose={onRequestClose}
          className={styles.root}
          title={t('Edit {{username}}', { username: selectedUser?.name })}
        >
          <DialogContent>
            <ErrorMessage error={error || updateUserError} />
            {selectedUser && (
              <div className={styles.header}>
                <UserAvatar user={selectedUser} size={100} />
                <div>
                  <h6 data-testid="UserName">{selectedUser.name}</h6>
                  {selectedUser.nickname && (
                    <p data-testid="UserNickname">
                      <strong>{selectedUser.nickname}</strong>
                    </p>
                  )}
                  <p data-testid="UserEmail">{selectedUser.email}</p>
                  {selectedUser.class && (
                    <p data-testid="UserClass">Klasse: {selectedUser.class}</p>
                  )}
                </div>
              </div>
            )}
            {loading && (
              <LinearProgress
                isIndeterminate
                aria-label={'Nutzer wird geladen'}
              />
            )}
            {data && (
              <>
                <Divider />
                <section data-testid="GroupSelectSection">
                  <GroupSelect
                    row
                    allowNoneSelection
                    hidePublicGroupSelection
                    disableAdminGroupsExclusivity
                    className={styles.groupSelect}
                    selectedGroups={assignedUserRoles}
                    onSelectGroups={(groups) =>
                      setAssignedUserRoles(groups.filter((g) => g !== null))
                    }
                    label={'Gruppe zuweisen'}
                  />
                </section>
                {!!dynamicGroups.length && (
                  <span data-testid="DynamicGroups">
                    Über Einschreibeschlüssel zugewiesene Gruppen:
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
              variant={'error'}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Benutzer löschen
            </Button>
            <Button onClick={() => onRequestClose()}>Abbrechen</Button>
            <LoadingButton
              style={{ marginLeft: 'auto' }}
              onComplete={() => {
                setTimeout(() => {
                  onRequestClose();
                }, 2500);
              }}
              onAction={() =>
                updateUser({
                  variables: {
                    id: selectedUser?.id ?? null!,
                    groups: assignedUserRoles.map((group) => ({
                      id: group.id,
                    })),
                  },
                })
              }
            >
              {t('save')}
            </LoadingButton>
          </DialogActions>
        </Dialog>
        {isDeleteDialogOpen && selectedUser && (
          <DeleteUserDialog
            onRequestClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={() => {
              setIsDeleteDialogOpen(false);
              onRequestClose();
            }}
            user={selectedUser}
          />
        )}
      </>
    );
  }
);
EditUserPermissionsDialog.displayName = 'EditUserPermissionsDialog';
