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
import { graphql } from 'api/graphql';
import { UserGroup } from '../_graphql';

import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticlesQuery.graphql';

export const DELETE_USER_GROUP = graphql(`
  mutation DeleteUserGroup($id: ID!) {
    deleteUserGroup(id: $id) {
      userGroup {
        id
      }
      unpublishedArticles {
        id
        insertedAt
        updatedAt
        title
        preview
        tags
        readyToPublish
        published
        isPinnedToTop
        previewImageFile {
          id
          mimeType
          fileType
          filename
          filesize
        }
        contentModules {
          id
          type
          content
          sortKey
          configuration
          files {
            id
            mimeType
            fileType
            filename
            filesize
            insertedAt
            formats {
              name
              url
              type
              availability {
                status
              }
            }
          }
        }
        category {
          id
          title
        }
        groups {
          id
          sortKey
          name
        }
        users {
          id
          nickname
          name
        }
      }
    }
  }
`);

export type DeleteUserGroupDialogProps = {
  group: UserGroup | null;
  onRequestClose(): void;
  onConfirm(): void;
};

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
      >(DELETE_USER_GROUP, {
        update: (cache, { data }) => {
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

            const normalizedId = cache.identify(
              data.deleteUserGroup.userGroup as any
            );
            if (normalizedId) {
              cache.evict({ id: normalizedId });
            }
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
                  Beiträge, die <em>ausschließlich</em> für diese Gruppe
                  sichtbar waren, werden wieder in den Status "zur Kontrolle
                  freigegeben" zurückversetzt und müssen neuen Gruppen
                  zugewiesen werden, um sichtbar zu sein.
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
                      Sie sind nun "zur Kontrolle freigegeben" und können von
                      einem Administrator wieder veröffentlicht werden.
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
