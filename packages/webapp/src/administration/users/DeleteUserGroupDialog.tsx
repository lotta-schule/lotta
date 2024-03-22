import * as React from 'react';
import { useMutation } from '@apollo/client';
import { UserGroupModel, ID, ArticleModel } from 'model';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  LoadingButton,
} from '@lotta-schule/hubert';

import GetUserGroupsQuery from 'api/query/GetUserGroupsQuery.graphql';
import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticlesQuery.graphql';
import DeleteUserGroupMutation from 'api/mutation/DeleteUserGroupMutation.graphql';

export interface DeleteUserGroupDialogProps {
  isOpen: boolean;
  group: UserGroupModel;
  onRequestClose(): void;
  onConfirm(): void;
}

export const DeleteUserGroupDialog = React.memo(
  ({
    isOpen,
    group,
    onRequestClose,
    onConfirm,
  }: DeleteUserGroupDialogProps) => {
    const [deleteUserGroup, { loading: isLoading, error }] = useMutation<
      {
        deleteUserGroup: {
          userGroup: UserGroupModel;
          unpublishedArticles: ArticleModel[];
        };
      },
      { id: ID }
    >(DeleteUserGroupMutation, {
      update: (cache, { data }) => {
        if (data?.deleteUserGroup?.userGroup) {
          const readUserGroupsResult = cache.readQuery<{
            userGroups: UserGroupModel[];
          }>({ query: GetUserGroupsQuery });
          cache.writeQuery<{ userGroups: UserGroupModel[] }>({
            query: GetUserGroupsQuery,
            data: {
              userGroups: (readUserGroupsResult?.userGroups ?? []).filter(
                (g) => g.id !== data.deleteUserGroup.userGroup.id
              ),
            },
          });
        }
        if (data?.deleteUserGroup?.userGroup) {
          const unpublishedArticlesResult = cache.readQuery<{
            articles: ArticleModel[];
          }>({ query: GetUnpublishedArticlesQuery });
          cache.writeQuery<{ articles: ArticleModel[] }>({
            query: GetUnpublishedArticlesQuery,
            data: {
              articles: [
                ...(unpublishedArticlesResult?.articles ?? []),
                ...(data.deleteUserGroup.unpublishedArticles ?? []),
              ],
            },
          });
        }
      },
      onCompleted: () => {
        onConfirm();
      },
    });

    return (
      <Dialog
        open={isOpen}
        onRequestClose={onRequestClose}
        title={'Gruppe löschen'}
      >
        <DialogContent>
          <ErrorMessage error={error} />
          <p>
            Möchtest du die Nutzergruppe "{group.name}" wirklich löschen? Sie
            ist dann unwiederbringlich verloren.
          </p>
          <p>
            Beiträge und Kategorien, die <em>ausschließlich</em> für diese
            Gruppe sichtbar waren, werden wieder "zur Veröffentlichunge
            freigegeben" gesetzt und müssen neu Gruppen zugewiesen werden um
            sichtbar zu sein.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onRequestClose()} disabled={isLoading}>
            Abbrechen
          </Button>
          <LoadingButton
            onAction={async () => {
              await deleteUserGroup({ variables: { id: group.id } });
            }}
            variant="error"
          >
            Gruppe endgültig löschen
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  }
);
DeleteUserGroupDialog.displayName = 'DeleteUserGroupDialog';
