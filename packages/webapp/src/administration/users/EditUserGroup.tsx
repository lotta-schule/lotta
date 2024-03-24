import * as React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { UserGroupModel, ID, UserGroupInputModel } from 'model';
import {
  Button,
  Checkbox,
  ErrorMessage,
  Input,
  Label,
  LinearProgress,
  LoadingButton,
} from '@lotta-schule/hubert';
import { useUserGroups } from 'util/tenant/useUserGroups';
import { EnrollmentTokensEditor } from 'profile/component/EnrollmentTokensEditor';

import UpdateUserGroupMutation from 'api/mutation/UpdateUserGroupMutation.graphql';
import GetGroupQuery from 'api/query/GetGroupQuery.graphql';

import styles from './EditUserGroup.module.scss';

export interface EditUserGroupProps {
  groupId: UserGroupModel['id'] | null;
  onRequestDeletion: (group: UserGroupModel) => void;
}

export const EditUserGroup = React.memo(
  ({ groupId, onRequestDeletion }: EditUserGroupProps) => {
    const groups = useUserGroups();

    const {
      data,
      loading: isLoading,
      error: loadDetailsError,
    } = useQuery<{ group: UserGroupModel }, { id: ID }>(GetGroupQuery, {
      variables: {
        id: groupId!,
      },
      skip: !groupId,
    });
    const [updateGroup, { loading: isLoadingUpdateGroup, error: updateError }] =
      useMutation<
        { group: UserGroupModel },
        { id: ID; group: UserGroupInputModel }
      >(UpdateUserGroupMutation);

    const group = data?.group;

    const [editedGroup, setEditedGroup] = React.useState<UserGroupModel | null>(
      group ?? null
    );

    React.useEffect(() => {
      if (group) {
        setEditedGroup(group);
      }
    }, [group]);

    const groupHasBeenChanged = React.useMemo(() => {
      if (!group || !editedGroup) {
        return false;
      }
      if (group.name !== editedGroup.name) {
        return true;
      }
      if (!!group.canReadFullName !== !!editedGroup.canReadFullName) {
        return true;
      }
      if (
        (group.enrollmentTokens ?? []).sort().join() !==
        (editedGroup.enrollmentTokens ?? []).sort().join()
      ) {
        return true;
      }
      return false;
    }, [group, editedGroup]);

    const isSoleAdminGroup =
      data?.group.isAdminGroup &&
      groups.filter((g) => g.isAdminGroup).length < 2;

    return (
      <div>
        {isLoading && (
          <LinearProgress
            aria-label={'Gruppeninformationen werden geladen'}
            isIndeterminate
          />
        )}
        {group && editedGroup && (
          <form
            aria-label={`Gruppe "${group.name}" bearbeiten`}
            className={styles.root}
          >
            <ErrorMessage error={loadDetailsError || updateError} />

            <section>
              <h4>Allgemein</h4>
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
            </section>

            <section>
              <h4>Berechtigungen</h4>
              {isSoleAdminGroup && (
                <Checkbox
                  isDisabled={isLoadingUpdateGroup || isSoleAdminGroup}
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
            </section>

            <section>
              <h4>Einschreibeschlüssel</h4>
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
                Gruppe Speichern
              </LoadingButton>
              {!isSoleAdminGroup && (
                <>
                  <Button
                    className={styles.deleteButton}
                    onClick={() => onRequestDeletion(group)}
                    variant="error"
                  >
                    Gruppe "{group.name}" löschen
                  </Button>
                </>
              )}
            </section>
          </form>
        )}
      </div>
    );
  }
);
EditUserGroup.displayName = 'AdministrationEditUserGroupDialog';
