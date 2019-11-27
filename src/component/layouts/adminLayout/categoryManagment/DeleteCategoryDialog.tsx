import React, { memo } from 'react';
import { CircularProgress, DialogTitle, DialogContent, DialogContentText, Button, DialogActions } from '@material-ui/core';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { ArticleModel, CategoryModel, ID } from 'model';
import { useQuery, useMutation } from 'react-apollo';
import { useCategories } from 'util/categories/useCategories';
import { GetArticlesQuery } from 'api/query/GetArticlesQuery';
import { DeleteCategoryMutation } from 'api/mutation/DeleteCategoryMutation';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';

export interface DeleteCategoryDialogProps {
    isOpen: boolean;
    categoryToDelete: CategoryModel;
    onClose(event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'auto'): void;
    onConfirm(): void;
}

export const DeleteCategoryDialog = memo<DeleteCategoryDialogProps>(({ isOpen, categoryToDelete, onClose, onConfirm }) => {

    const [categories] = useCategories();
    const { data: articlesData, loading: isLoadingArticles } = useQuery<{ articles: ArticleModel[] }, { categoryId: ID }>(
        GetArticlesQuery,
        {
            variables: { categoryId: categoryToDelete.id }
        },
    );
    const [deleteCategory, { loading: isLoading, error }] = useMutation<{ category: CategoryModel }, { id: ID }>(DeleteCategoryMutation, {
        update: (cache, { data }) => {
            let categories: CategoryModel[] = [];
            if (data && data.category) {
                const readCategoriesResult = cache.readQuery<{ categories: CategoryModel[] }>({ query: GetCategoriesQuery });
                if (readCategoriesResult && readCategoriesResult.categories) {
                    categories = [...readCategoriesResult.categories];
                }
                cache.writeQuery<{ categories: CategoryModel[] }>({
                    query: GetCategoriesQuery,
                    data: {
                        categories: [...categories].filter(c => c.id !== data.category.id)
                    }
                });
            }
        },
        onCompleted: () => {
            onConfirm();
        }
    });

    return (
        <ResponsiveFullScreenDialog open={isOpen} onClose={onClose} aria-labelledby="delete-category-dialog">
            <DialogTitle id="delete-category-dialog-title">Kategorie löschen</DialogTitle>
            <DialogContent>
                {error && (
                    <p style={{ color: 'red' }}>{error.message}</p>
                )}
                <DialogContentText>
                    Möchtest du die folgende Kategorie wirklich löschen? Sie ist dann unwiederbringlich verloren.
                </DialogContentText>
                <DialogContentText>
                    Alle Beiträge, die dieser Kategorie zugeordnet sind, sind dann ohne Kategorie und damit nicht mehr sichtbar.<br />
                    <em>Beiträge: {isLoadingArticles ? <CircularProgress /> : articlesData && articlesData.articles.length}</em>
                </DialogContentText>
                {!categoryToDelete.isSidenav && (
                    <DialogContentText>
                        Unterkategorien, die dieser Kategorie zugeordnet waren, werden zu Hauptkategorien.<br />
                        <em>Unterkategorien: {categories.filter(cat => cat.category && cat.category.id === categoryToDelete.id).length}</em>
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    color={'primary'}
                    onClick={e => onClose(e, 'auto')}
                    disabled={isLoading}
                >
                    Abbrechen
                </Button>
                <Button
                    color={'secondary'}
                    onClick={() => deleteCategory({ variables: { id: categoryToDelete.id } })}
                    disabled={isLoading}
                >
                    Kategorie endgültig löschen
                </Button>
            </DialogActions>
        </ResponsiveFullScreenDialog>
    );
});