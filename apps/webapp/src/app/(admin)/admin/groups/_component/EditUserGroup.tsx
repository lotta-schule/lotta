'use client';
import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Button,
  Checkbox,
  ErrorMessage,
  Input,
  Label,
  LoadingButton,
  Eduplaces as EduplacesIcon,
} from '@lotta-schule/hubert';
import { EnrollmentTokensEditor } from 'profile/component/EnrollmentTokensEditor';
import { DeleteUserGroupDialog } from './DeleteUserGroupDialog';
import { AdminPageSection } from 'app/(admin)/admin/_component/AdminPageSection';
import { useRouter } from 'next/navigation';
import { UPDATE_USER_GROUP } from '../_graphql';
import { ResultOf } from 'gql.tada';
import { type GET_GROUP_QUERY } from 'loader';

import styles from './EditUserGroup.module.scss';

export type EditUserGroupProps = {
  group: NonNullable<ResultOf<typeof GET_GROUP_QUERY>['group']>;
};

export const EditUserGroup = React.memo(({ group }: EditUserGroupProps) => {
  const router = useRouter();
  const [isDeleteUserGroupDialogOpen, setIsDeleteUserGroupDialogOpen] =
    React.useState(false);
  const [updateGroup, { loading: isLoadingUpdateGroup, error: updateError }] =
    useMutation(UPDATE_USER_GROUP);

  const [editedGroup, setEditedGroup] = React.useState({
    ...group,
    enrollmentTokens: [...(group.enrollmentTokens ?? []), ''],
  });

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
        .filter((t) => t)
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

          {!!group.eduplacesId && (
            <div className={styles.notice}>
              <EduplacesIcon />
              <div>
                Diese Gruppe wird von Eduplaces verwaltet. Änderungen müssen in
                Eduplaces vorgenommen werden.
              </div>
            </div>
          )}

          {!group.eduplacesId && (
            <>
              <AdminPageSection title="Allgemein">
                <Label label={'Gruppenname'} disabled={!!group.eduplacesId}>
                  <Input
                    id="group-name"
                    readOnly={!!group.eduplacesId}
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
                  Diese Gruppe kann die vollständigen Namen von Nutzern sehen,
                  auch wenn diese sie nicht freigegeben haben
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
                          enrollmentTokens: editedGroup.enrollmentTokens.filter(
                            (t) => t
                          ),
                        },
                      },
                    });
                  }}
                >
                  speichern
                </LoadingButton>
              </AdminPageSection>
            </>
          )}
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
