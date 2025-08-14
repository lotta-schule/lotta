'use client';

import * as React from 'react';
import { useMutation } from '@apollo/client';
import { UserGroupModel } from 'model';
import {
  Button,
  Checkbox,
  ErrorMessage,
  Input,
  Label,
  LoadingButton,
} from '@lotta-schule/hubert';
import { EnrollmentTokensEditor } from 'profile/component/EnrollmentTokensEditor';
import { DeleteUserGroupDialog } from './DeleteUserGroupDialog';
import { AdminPageSection } from 'app/(admin)/admin/_component/AdminPageSection';
import { useRouter } from 'next/navigation';
import { UPDATE_USER_GROUP } from '../_graphql';

import styles from './EditUserGroup.module.scss';

export interface EditUserGroupProps {
  group: UserGroupModel;
}

export const EditUserGroup = React.memo(({ group }: EditUserGroupProps) => {
  const router = useRouter();
  const [isDeleteUserGroupDialogOpen, setIsDeleteUserGroupDialogOpen] =
    React.useState(false);
  const [updateGroup, { loading: isLoadingUpdateGroup, error: updateError }] =
    useMutation(UPDATE_USER_GROUP);

  const [editedGroup, setEditedGroup] = React.useState(group);

  React.useEffect(() => {
    if (group) {
      setEditedGroup(group);
    }
  }, [group]);

  const groupHasBeenChanged = React.useMemo(() => {
    if (group.name !== editedGroup.name) {
      return true;
    }
    if (!!group.canReadFullName !== !!editedGroup.canReadFullName) {
      return true;
    }
    if (
      Array.from(group.enrollmentTokens ?? [])
        .sort()
        .join() !==
      Array.from(editedGroup.enrollmentTokens ?? [])
        .sort()
        .join()
    ) {
      return true;
    }
    return false;
  }, [
    editedGroup.canReadFullName,
    editedGroup.enrollmentTokens,
    editedGroup.name,
    group.canReadFullName,
    group.enrollmentTokens,
    group.name,
  ]);

  return (
    <>
      {editedGroup && (
        <form
          aria-label={`Gruppe "${group.name}" bearbeiten`}
          className={styles.root}
        >
          <ErrorMessage error={updateError} />

          <AdminPageSection title="Allgemein">
            <Label label={'Gruppenname'}>
              <Input
                id="group-name"
                aria-describedby="group-name-help-text"
                disabled={isLoadingUpdateGroup}
                value={editedGroup.name}
                onChange={(e) =>
                  setEditedGroup({
                    ...editedGroup,
                    name: (e.target as HTMLInputElement).value,
                  })
                }
              />
            </Label>
            <small id="group-name-help-text">
              Gib der Gruppe einen verständlichen Namen
            </small>
          </AdminPageSection>

          <AdminPageSection title="Berechtigungen">
            {group.isAdminGroup && (
              <Checkbox
                isDisabled={isLoadingUpdateGroup || group.isAdminGroup}
                isSelected={!!editedGroup.isAdminGroup}
              >
                Diese Gruppe hat universelle Administratorrechte
              </Checkbox>
            )}

            <Checkbox
              isDisabled={isLoadingUpdateGroup || group.isAdminGroup}
              isSelected={
                (editedGroup.canReadFullName || group.isAdminGroup) ?? false
              }
              onChange={(isSelected) => {
                setEditedGroup({
                  ...editedGroup,
                  canReadFullName: isSelected,
                });
              }}
            >
              Diese Gruppe kann die vollständigen Namen von Nutzern sehen, auch
              wenn diese sie nicht freigegeben haben
            </Checkbox>
          </AdminPageSection>

          <AdminPageSection title="Einschreibeschlüssel">
            <p>
              Nutzer, die bei der Registrierung einen Einschreibeschlüssel
              verwenden, werden automatisch dieser Gruppe zugeordnet.
            </p>

            <EnrollmentTokensEditor
              disabled={isLoadingUpdateGroup}
              tokens={editedGroup.enrollmentTokens}
              setTokens={(enrollmentTokens) => {
                setEditedGroup({
                  ...editedGroup,
                  enrollmentTokens,
                });
              }}
            />
          </AdminPageSection>

          <AdminPageSection bottomToolbar>
            {!group.isAdminGroup && (
              <>
                <Button
                  className={styles.deleteButton}
                  variant="error"
                  onClick={() => setIsDeleteUserGroupDialogOpen(true)}
                >
                  "{group.name}" löschen
                </Button>
              </>
            )}

            <LoadingButton
              type="submit"
              disabled={!groupHasBeenChanged}
              className={styles.saveButton}
              onAction={async () => {
                await updateGroup({
                  variables: {
                    id: group.id,
                    group: {
                      name: editedGroup.name,
                      isAdminGroup: editedGroup.isAdminGroup,
                      canReadFullName: editedGroup.canReadFullName,
                      enrollmentTokens: editedGroup.enrollmentTokens,
                    },
                  },
                });
              }}
            >
              speichern
            </LoadingButton>
          </AdminPageSection>
        </form>
      )}
      <DeleteUserGroupDialog
        group={isDeleteUserGroupDialogOpen ? group : null}
        onRequestClose={() => setIsDeleteUserGroupDialogOpen(false)}
        onConfirm={() => {
          setIsDeleteUserGroupDialogOpen(false);
          router.replace('/admin/groups');
        }}
      />
    </>
  );
});
EditUserGroup.displayName = 'AdministrationEditUserGroupDialog';
