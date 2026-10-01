import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  ErrorMessage,
  FileSize,
  LoadingButton,
} from '@lotta-schule/hubert';
import { GroupSelect } from '#/shared/edit/GroupSelect';
import { UserAvatar } from '#/shared/userAvatar/UserAvatar';
import { DeleteUserDialog } from './DeleteUserDialog';
import { type SEARCH_USERS_RESULT } from '../_graphql/SearchUsersAsAdmin';

import UpdateUserMutation from '#/api/mutation/UpdateUserMutation.graphql';

import styles from './EditUserPermissionDialog.module.scss';

export type EditUserPermissionsDialogProps = {
  selectedUser: SEARCH_USERS_RESULT[number] | null;
  onRequestClose: () => void;
};

export const EditUserPermissionsDialog = React.memo(
  ({ selectedUser, onRequestClose }: EditUserPermissionsDialogProps) => {
    const { t } = useTranslation();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [assignedUserRoles, setAssignedUserRoles] = React.useState<
      Exclude<typeof selectedUser, null>['assignedGroups']
    >([]);

    React.useEffect(() => {
      if (selectedUser?.assignedGroups) {
        setAssignedUserRoles(selectedUser.assignedGroups);
      }
    }, [selectedUser]);

    const [updateUser, { error: updateUserError }] =
      useMutation(UpdateUserMutation);

    const dynamicGroups = React.useMemo(
      () =>
        selectedUser?.groups?.filter(
          (group) =>
            !(selectedUser?.assignedGroups ?? []).find(
              (assignedGroup) => assignedGroup?.id === group?.id
            )
        ) ?? [],
      [selectedUser]
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
            <ErrorMessage error={updateUserError} />
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
                  {selectedUser.usedStorageSize !== null && (
                    <p data-testid="UsedStorageSize">
                      Speichernutzung:{' '}
                      {new FileSize(selectedUser.usedStorageSize).humanize()}
                    </p>
                  )}
                </div>
              </div>
            )}
            {selectedUser && (
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
