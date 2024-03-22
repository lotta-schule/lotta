import * as React from 'react';
import { useMutation } from '@apollo/client';
import { UserGroupModel, ID, ArticleModel } from 'model';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  List,
  ListItem,
  LoadingButton,
} from '@lotta-schule/hubert';

import GetUserGroupsQuery from 'api/query/GetUserGroupsQuery.graphql';
import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticlesQuery.graphql';
import DeleteUserGroupMutation from 'api/mutation/DeleteUserGroupMutation.graphql';

export interface DeleteUserGroupDialogProps {
  group: UserGroupModel | null;
  onRequestClose(): void;
  onConfirm(): void;
}

export const DeleteUserGroupDialog = React.memo(
  ({ group, onRequestClose, onConfirm }: DeleteUserGroupDialogProps) => {
    const [deleteUserGroup, { loading: isLoading, error, data, reset }] =
      useMutation<
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
      });

    React.useEffect(() => {
      if (group === null) {
        reset();
      }
    }, [group, reset]);

    return (
      <Dialog
        open={group !== null}
        onRequestClose={() => {
          if (data) {
            onConfirm();
          } else {
            onRequestClose();
          }
        }}
        title={'Gruppe löschen'}
      >
        {group && (
          <DialogContent>
            <ErrorMessage error={error} />
            {!data && (
              <>
                <p>
                  Möchtest du die Nutzergruppe "{group.name}" wirklich löschen?
                  Sie ist dann unwiederbringlich verloren.
                </p>
                <p>
                  Beiträge und Kategorien, die <em>ausschließlich</em> für diese
                  Gruppe sichtbar waren, werden wieder "zur Veröffentlichunge
                  freigegeben" gesetzt und müssen neu Gruppen zugewiesen werden
                  um sichtbar zu sein.
                </p>
              </>
            )}
            {data?.deleteUserGroup && (
              <>
                <p>Die Gruppe "{group.name}" wurde erfolgreich gelöscht.</p>
                {!data.deleteUserGroup.unpublishedArticles.length && (
                  <p>
                    Es gibt keine Beiträge, die nur dieser Gruppe zugeordnet
                    waren. Alle Beiträge sind noch verfügbar.
                  </p>
                )}
                {!!data.deleteUserGroup.unpublishedArticles.length && (
                  <>
                    <p>
                      Es wurden{' '}
                      <strong>
                        {data.deleteUserGroup.unpublishedArticles.length}
                      </strong>{' '}
                      Beiträge zurückgezogen.
                    </p>
                    <p>
                      Sie sind nun "zur Veröffentlichung freigegeben" und können
                      von einem Administrator wieder veröffentlicht werden.
                    </p>
                    <List>
                      {data.deleteUserGroup.unpublishedArticles.map(
                        (article) => (
                          <ListItem key={article.id}>{article.title}</ListItem>
                        )
                      )}
                    </List>
                  </>
                )}
              </>
            )}
          </DialogContent>
        )}
        {group && (
          <DialogActions>
            {!data && (
              <Button onClick={() => onRequestClose()} disabled={isLoading}>
                Abbrechen
              </Button>
            )}
            {data && <Button onClick={() => onConfirm()}>Schließen</Button>}
            <LoadingButton
              onAction={async () => {
                await deleteUserGroup({ variables: { id: group.id } });
              }}
              resetState={false}
              variant={data ? undefined : 'error'}
            >
              Gruppe endgültig löschen
            </LoadingButton>
          </DialogActions>
        )}
      </Dialog>
    );
  }
);
DeleteUserGroupDialog.displayName = 'DeleteUserGroupDialog';
