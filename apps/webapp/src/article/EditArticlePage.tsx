'use client';

import * as React from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { ArticleModel, ID } from 'model';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@lotta-schule/hubert';
import { AddModuleBar } from 'article/editor/AddModuleBar';
import { ArticleEditable as Article } from 'article/ArticleEditable';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Article as ArticleUtil } from 'util/model/Article';
import { EditArticleFooter } from './editor/EditArticleFooter';
import { Main } from 'layout';
import { useRouter } from 'next/navigation';
import omit from 'lodash/omit';

import ArticleIsUpdatedSubscription from 'api/subscription/GetArticleSubscription.graphql';
import UpdateArticleMutation from 'api/mutation/UpdateArticleMutation.graphql';
import GetArticleQuery from 'api/query/GetArticleQuery.graphql';

export interface EditArticlePageProps {
  article: ArticleModel;
}

export const EditArticlePage = React.memo(
  ({ article }: EditArticlePageProps) => {
    const router = useRouter();
    const currentUser = useCurrentUser();

    const [isArticleDirty, setIsArticleDirty] = React.useState(false);
    const [editedArticle, setEditedArticle] = React.useState(article);
    const [isUpdatedArticleModalVisible, setIsUpdatedArticleModalVisible] =
      React.useState(false);

    React.useEffect(() => {
      setEditedArticle((editedArticle) => {
        if (article.id === editedArticle.id) {
          return {
            ...editedArticle,
            ...article,
            contentModules: editedArticle.contentModules,
          };
        }

        return editedArticle;
      });
    }, [article]);

    const [saveArticle, { loading: isLoading, data: updatedArticleData }] =
      useMutation<{ article: ArticleModel }, { id: ID; article: any }>(
        UpdateArticleMutation,
        {
          onCompleted: () => {
            setIsArticleDirty(false);
          },
        }
      );

    React.useEffect(() => {
      // We want to wait for a response from the UpdateArticleMutation (updatedArticleData is set)
      // As well as be sure that isArticleDirty state has been set to false
      // before redirecting the user back to the article page, in order not to see the
      // "Do you really want to leave" screen
      if (updatedArticleData?.article && isArticleDirty === false) {
        router.push(ArticleUtil.getPath(article));
      }
    }, [updatedArticleData, isArticleDirty, article, router]);

    useSubscription<{ article: ArticleModel }, { id: ID }>(
      ArticleIsUpdatedSubscription,
      {
        variables: { id: article.id },
        skip: isLoading || !!updatedArticleData?.article,
        onData: ({ client, data: { data } }) => {
          if (data) {
            client.writeQuery({
              query: GetArticleQuery,
              variables: { id: article.id },
              data,
            });
            const updatedContentModules = data.article.contentModules.filter(
              (cm) => {
                const existingModule = editedArticle.contentModules.find(
                  (_cm) => _cm.id === cm.id
                );
                return (
                  existingModule &&
                  new Date(cm.updatedAt).getTime() >
                    new Date(existingModule.updatedAt).getTime()
                );
              }
            );
            const newContentModules = editedArticle.contentModules.filter(
              (_cm) => /^-/.test(_cm.id)
            );
            if (newContentModules.length || updatedContentModules.length) {
              setIsUpdatedArticleModalVisible(true);
            }
          }
        },
      }
    );

    React.useEffect(() => {
      if (!currentUser) {
        router.push(ArticleUtil.getPath(article));
      }
    }, [article, currentUser, router]);

    const changeArticle = React.useCallback(
      (article: React.SetStateAction<ArticleModel>) => {
        setEditedArticle(article);
        setIsArticleDirty(true);
      },
      []
    );

    return (
      <>
        <Main>
          <Article article={editedArticle} onUpdateArticle={changeArticle} />
          <AddModuleBar
            onAddModule={async (contentModule) => {
              changeArticle({
                ...editedArticle,
                contentModules: [
                  ...editedArticle.contentModules,
                  {
                    configuration: {},
                    ...contentModule,
                    insertedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    sortKey: editedArticle.contentModules.length
                      ? Math.max(
                          ...editedArticle.contentModules.map(
                            (cm) => cm.sortKey || 0
                          )
                        ) + 10
                      : 0,
                  },
                ],
              });
            }}
          />
          <EditArticleFooter
            style={{ marginTop: '.5em' }}
            article={editedArticle}
            onUpdate={changeArticle}
            isLoading={isLoading}
            onSave={(additionalProps) => {
              const article = {
                ...(omit(editedArticle, [
                  // isPinnedToTop is set via an extra button
                  'isPinnedToTop',
                  // updatedAt is only set if it should explicitly be overwritten
                  'updatedAt',
                ]) as ArticleModel),
                ...additionalProps,
                contentModules: editedArticle.contentModules.map((cm) => ({
                  ...cm,
                  content: cm.content ? JSON.stringify(cm.content) : cm.content,
                  configuration: JSON.stringify(cm.configuration || {}),
                })),
              };
              saveArticle({
                variables: {
                  id: article.id,
                  article: {
                    ...omit(article, ['id', 'reactionCounts']),
                    contentModules: article.contentModules.map((cm) => ({
                      ...omit(
                        cm,
                        ...(/^-/.test(cm.id) ? ['id'] : []),
                        'updatedAt',
                        'insertedAt'
                      ),
                      content: cm.content || null,
                      files: cm.files?.map(({ id }) => ({
                        id,
                      })),
                    })),
                    previewImageFile: article.previewImageFile
                      ? {
                          id: article.previewImageFile.id,
                        }
                      : null,
                    category: article.category
                      ? { id: article.category.id }
                      : null,
                    groups: article.groups.map(({ id }) => ({
                      id,
                    })),
                    users: article.users.map(({ id }) => ({
                      id,
                    })),
                  },
                },
              });
            }}
          />
          <Dialog
            open={isUpdatedArticleModalVisible}
            onRequestClose={() => setIsUpdatedArticleModalVisible(false)}
            title={'Beitrag wurde von einem anderen Nutzer aktualisiert.'}
          >
            <DialogContent>
              <p>Module des Beitrags von einem Nutzer verändert.</p>
              <p>
                Möchtest du den veränderten Beitrag laden? Allerdings gehen
                dadurch deine Änderungen verloren.
              </p>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsUpdatedArticleModalVisible(false)}>
                Nichts tun
              </Button>
              <Button
                onClick={() => {
                  changeArticle(article);
                  setIsArticleDirty(false);
                  setIsUpdatedArticleModalVisible(false);
                }}
              >
                Änderungen laden
              </Button>
            </DialogActions>
          </Dialog>
        </Main>
      </>
    );
  }
);
EditArticlePage.displayName = 'EditArticlePage';

export default EditArticlePage;
