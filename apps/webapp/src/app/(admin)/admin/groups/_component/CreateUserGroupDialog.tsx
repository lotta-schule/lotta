import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { UserGroupModel } from 'model';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  Input,
  Label,
} from '@lotta-schule/hubert';
import { graphql } from 'api/graphql';
import { GET_USER_GROUPS } from '../_graphql';

export const CREATE_USER_GROUP = graphql(`
  mutation CreateUserGroup($group: UserGroupInput!) {
    group: createUserGroup(group: $group) {
      id
      name
      insertedAt
      updatedAt
      isAdminGroup
      canReadFullName
      sortKey
      enrollmentTokens
    }
  }
`);

export interface CreateUserGroupDialogProps {
  isOpen: boolean;
  onAbort(): void;
  onConfirm(group: UserGroupModel): void;
}

export const CreateUserGroupDialog = React.memo<CreateUserGroupDialogProps>(
  ({ isOpen, onAbort, onConfirm }) => {
    const [name, setName] = React.useState('');
    const [createUserGroup, { loading: isLoading, error }] = useMutation(
      CREATE_USER_GROUP,
      {
        update: (cache, { data }) => {
          if (data?.group) {
            const readUserGroupsResult = cache.readQuery({
              query: GET_USER_GROUPS,
            });
            cache.writeQuery({
              query: GET_USER_GROUPS,
              data: {
                userGroups: [
                  ...(readUserGroupsResult?.userGroups ?? []),
                  data.group,
                ],
              },
            });
          }
        },
        onCompleted: ({ group }) => {
          onConfirm(group);
        },
      }
    );
    const resetForm = () => {
      setName('');
    };
    return (
      <Dialog
        open={isOpen}
        onRequestClose={onAbort}
        title={'Nutzergruppe erstellen'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createUserGroup({
              variables: {
                group: {
                  name,
                  enrollmentTokens: [],
                },
              },
            });
          }}
        >
          <DialogContent>
            <p>Erstelle eine neue Gruppe</p>
            <ErrorMessage error={error} />
            <Label label="Name der Gruppe:">
              <Input
                autoFocus
                required
                id="name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                disabled={isLoading}
                placeholder="Neue Gruppe"
              />
            </Label>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                resetForm();
                onAbort();
              }}
            >
              Abbrechen
            </Button>
            <Button type={'submit'} disabled={!name || isLoading}>
              Gruppe erstellen
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
CreateUserGroupDialog.displayName = 'CreateUserGroupDialog';
