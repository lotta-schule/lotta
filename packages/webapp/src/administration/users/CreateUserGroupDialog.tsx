import * as React from 'react';
import { useMutation } from '@apollo/client';
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

import GetUserGroupsQuery from 'api/query/GetUserGroupsQuery.graphql';
import CreateUserGroupMutation from 'api/mutation/CreateUserGroupMutation.graphql';

export interface CreateUserGroupDialogProps {
  isOpen: boolean;
  onAbort(): void;
  onConfirm(group: UserGroupModel): void;
}

export const CreateUserGroupDialog = React.memo<CreateUserGroupDialogProps>(
  ({ isOpen, onAbort, onConfirm }) => {
    const [name, setName] = React.useState('');
    const [createUserGroup, { loading: isLoading, error }] = useMutation<
      { group: UserGroupModel },
      { group: Partial<UserGroupModel> }
    >(CreateUserGroupMutation, {
      update: (cache, { data }) => {
        if (data?.group) {
          const readUserGroupsResult = cache.readQuery<{
            userGroups: UserGroupModel[];
          }>({ query: GetUserGroupsQuery });
          cache.writeQuery<{ userGroups: UserGroupModel[] }>({
            query: GetUserGroupsQuery,
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
    });
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
