import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Input,
  ErrorMessage,
  Label,
} from '@lotta-schule/hubert';
import { ArticleModel, ArticleModelInput } from 'model';

import CreateArticleMutation from 'api/mutation/CreateArticleMutation.graphql';
import GetOwnArticlesQuery from 'api/query/GetOwnArticles.graphql';

export interface CreateArticleDialogProps {
  isOpen: boolean;
  onConfirm(article: ArticleModel): void;
  onAbort(): void;
}

export const CreateArticleDialog = React.memo(
  ({ isOpen, onConfirm, onAbort }: CreateArticleDialogProps) => {
    const [title, setTitle] = React.useState('');
    const [createArticle, { loading: isLoading, error }] = useMutation<
      { article: ArticleModel },
      { article: Partial<ArticleModelInput> }
    >(CreateArticleMutation, {
      variables: { article: { title } },
      update: (cache, { data }) => {
        if (data && data.article) {
          let ownArticles: ArticleModel[] = [];
          try {
            const readOwnArticlesResult = cache.readQuery<{
              articles: ArticleModel[];
            }>({ query: GetOwnArticlesQuery });
            if (readOwnArticlesResult && readOwnArticlesResult.articles) {
              ownArticles = [...readOwnArticlesResult.articles];
            }
          } catch (e) {
            console.debug(e);
          }
          cache.writeQuery<{ articles: ArticleModel[] }>({
            query: GetOwnArticlesQuery,
            data: {
              articles: [...ownArticles, data.article],
            },
          });
        }
      },
      onCompleted: ({ article }) => {
        onConfirm(article);
      },
    });
    const resetForm = () => {
      setTitle('');
    };
    return (
      <Dialog
        open={isOpen}
        onRequestClose={onAbort}
        title={'Beitrag erstellen'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createArticle();
          }}
        >
          <DialogContent>
            Wähle zunächst einen Titel für deinen Beitrag
            <ErrorMessage error={error} />
            <Label label="Titel des Beitrags:">
              <Input
                autoFocus
                id="title"
                value={title}
                onChange={({ currentTarget }) => setTitle(currentTarget.value)}
                disabled={isLoading}
                placeholder="Mein neuer Beitrag"
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
            <Button type={'submit'} disabled={!title || isLoading}>
              Beitrag erstellen
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
CreateArticleDialog.displayName = 'CreateArticleDialog';
