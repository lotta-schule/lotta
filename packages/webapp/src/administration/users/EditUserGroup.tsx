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

    const group = groups.find((g) => g.id === groupId);

    const [name, setName] = React.useState(group?.name ?? '');

    const {
      data,
      loading: isLoading,
      error: loadDetailsError,
    } = useQuery<{ group: UserGroupModel }, { id: ID }>(GetGroupQuery, {
      variables: {
        id: group?.id ?? '', // We know that group is not null here becuase of the skip
      },
      skip: !group,
    });
    const [updateGroup, { loading: isLoadingUpdateGroup, error: updateError }] =
      useMutation<
        { group: UserGroupModel },
        { id: ID; group: UserGroupInputModel }
      >(UpdateUserGroupMutation);

    React.useEffect(() => {
      if (data?.group) {
        setName(data.group.name);
      }
    }, [data]);

    const isSoleAdminGroup =
      data?.group.isAdminGroup &&
      groups.filter((g) => g.isAdminGroup).length < 2;

    const enrollmentTokens = data?.group.enrollmentTokens ?? [];

    return (
      <div>
        {isLoading && (
          <LinearProgress
            aria-label={'Gruppeninformationen werden geladen'}
            isIndeterminate
          />
        )}
        {group && (
          <form
            aria-label={`Gruppe "${group.name}" bearbeiten`}
            className={styles.root}
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <ErrorMessage error={loadDetailsError || updateError} />

            <section>
              <h4>Allgemein</h4>
              <Label label={'Gruppenname'}>
                <Input
                  id="group-name"
                  aria-describedby="group-name-help-text"
                  disabled={isLoadingUpdateGroup}
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  onBlur={() => {
                    updateGroup({
                      variables: {
                        id: group.id,
                        group: {
                          isAdminGroup: group.isAdminGroup,
                          canReadFullName: !!group.canReadFullName,
                          enrollmentTokens,
                          name,
                        },
                      },
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateGroup({
                        variables: {
                          id: group.id,
                          group: {
                            isAdminGroup: group.isAdminGroup,
                            canReadFullName: !!group.canReadFullName,
                            enrollmentTokens,
                            name,
                          },
                        },
                      });
                    }
                  }}
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
                  isSelected={!!group.isAdminGroup}
                >
                  Diese Gruppe hat universelle Administratorrechte
                </Checkbox>
              )}

              <Checkbox
                isDisabled={isLoadingUpdateGroup || group.isAdminGroup}
                isSelected={
                  (group.canReadFullName || group.isAdminGroup) ?? false
                }
                onChange={(isSelected) => {
                  updateGroup({
                    variables: {
                      id: group.id,
                      group: {
                        name,
                        canReadFullName: isSelected,
                        enrollmentTokens,
                        isAdminGroup: group.isAdminGroup,
                      },
                    },
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
                Nutzer, die bei der Registrierung einen
                Einschreibeschlüsselverwenden, werden automatisch dieser Gruppe
                zugeordnet.
              </p>

              <EnrollmentTokensEditor
                disabled={isLoadingUpdateGroup}
                tokens={enrollmentTokens}
                setTokens={(enrollmentTokens) => {
                  updateGroup({
                    variables: {
                      id: group.id,
                      group: {
                        isAdminGroup: group.isAdminGroup,
                        canReadFullName: group.canReadFullName,
                        enrollmentTokens,
                        name,
                      },
                    },
                  });
                }}
              />
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
