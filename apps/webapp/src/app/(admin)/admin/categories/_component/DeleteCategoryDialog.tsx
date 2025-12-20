import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { ArticleModel, CategoryModel, ID } from 'model';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  LinearProgress,
  LoadingButton,
} from '@lotta-schule/hubert';
import { useCategories } from 'util/categories/useCategories';

import DeleteCategoryMutation from 'api/mutation/DeleteCategoryMutation.graphql';
import GetArticlesQuery from 'api/query/GetArticlesQuery.graphql';

export interface DeleteCategoryDialogProps {
  isOpen: boolean;
  categoryToDelete: CategoryModel;
  onRequestClose(): void;
  onConfirm(): void;
}

export const DeleteCategoryDialog = React.memo<DeleteCategoryDialogProps>(
  ({ isOpen, categoryToDelete, onRequestClose, onConfirm }) => {
    const [categories] = useCategories();
    const { data: articlesData, loading: isLoadingArticles } = useQuery<
      { articles: ArticleModel[] },
      { categoryId: ID }
    >(GetArticlesQuery, {
      variables: { categoryId: categoryToDelete.id },
    });
    const [deleteCategory, { loading: isLoading, error }] = useMutation<
      { category: CategoryModel },
      { id: ID }
    >(DeleteCategoryMutation, {
      update: (cache, { data }) => {
        if (data?.category) {
          const normalizedId = cache.identify(data.category as any);
          if (normalizedId) {
            cache.evict({ id: normalizedId });
          }
        }
      },
    });

    return (
      <Dialog
        open={isOpen}
        onRequestClose={onRequestClose}
        title={'Kategorie löschen'}
      >
        <DialogContent>
          <ErrorMessage error={error} />
          <p>
            Möchtest du die folgende Kategorie wirklich löschen? Sie ist dann
            unwiederbringlich verloren.
          </p>
          <p>
            Alle Beiträge, die dieser Kategorie zugeordnet sind, sind dann ohne
            Kategorie und nur über direkten Link erreichbar.
          </p>
          {isLoadingArticles ? (
            <LinearProgress isIndeterminate label={'Beiträge werden geladen'} />
          ) : (
            <em>Beiträge: {articlesData?.articles.length ?? 0}</em>
          )}
          {!categoryToDelete.isSidenav && (
            <p>
              Unterkategorien, die dieser Kategorie zugeordnet waren, werden in
              die Hauptnavigation einsortiert.
              <br />
              <em>
                Unterkategorien:&nbsp;
                {
                  categories.filter(
                    (cat) =>
                      cat.category && cat.category.id === categoryToDelete.id
                  ).length
                }
              </em>
            </p>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(_e: React.MouseEvent) => onRequestClose()}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <LoadingButton
            onAction={async () =>
              await deleteCategory({
                variables: { id: categoryToDelete.id },
              })
            }
            onComplete={onConfirm}
          >
            Kategorie endgültig löschen
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  }
);
DeleteCategoryDialog.displayName = 'DeleteCategoryDialog';
