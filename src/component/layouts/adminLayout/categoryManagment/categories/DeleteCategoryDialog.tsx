import * as React from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    LinearProgress,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { ArticleModel, CategoryModel, ID } from 'model';
import { useQuery, useMutation } from '@apollo/client';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { useCategories } from 'util/categories/useCategories';
import { GetArticlesQuery } from 'api/query/GetArticlesQuery';
import { DeleteCategoryMutation } from 'api/mutation/DeleteCategoryMutation';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';

export interface DeleteCategoryDialogProps {
    isOpen: boolean;
    categoryToDelete: CategoryModel;
    onClose(
        event: {},
        reason: 'backdropClick' | 'escapeKeyDown' | 'auto'
    ): void;
    onConfirm(): void;
}

export const DeleteCategoryDialog = React.memo<DeleteCategoryDialogProps>(
    ({ isOpen, categoryToDelete, onClose, onConfirm }) => {
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
                let categories: CategoryModel[] = [];
                if (data && data.category) {
                    const readCategoriesResult = cache.readQuery<{
                        categories: CategoryModel[];
                    }>({ query: GetCategoriesQuery });
                    if (
                        readCategoriesResult &&
                        readCategoriesResult.categories
                    ) {
                        categories = [...readCategoriesResult.categories];
                    }
                    cache.writeQuery<{ categories: CategoryModel[] }>({
                        query: GetCategoriesQuery,
                        data: {
                            categories: [...categories]
                                .filter((c) => c.id !== data.category.id)
                                .map((c) => ({
                                    ...c,
                                    category:
                                        c.category?.id === data.category.id
                                            ? null
                                            : c.category,
                                })),
                        },
                    });
                }
            },
            onCompleted: () => {
                onConfirm();
            },
        });

        return (
            <ResponsiveFullScreenDialog
                open={isOpen}
                onClose={onClose}
                aria-labelledby="delete-category-dialog"
            >
                {isLoading && <LinearProgress />}
                <DialogTitle id="delete-category-dialog-title">
                    Kategorie löschen
                </DialogTitle>
                <DialogContent>
                    <ErrorMessage error={error} />
                    <DialogContentText>
                        Möchtest du die folgende Kategorie wirklich löschen? Sie
                        ist dann unwiederbringlich verloren.
                    </DialogContentText>
                    <DialogContentText>
                        Alle Beiträge, die dieser Kategorie zugeordnet sind,
                        sind dann ohne Kategorie und nur über direkten Link
                        erreichbar.
                        <br />
                        <em>
                            Beiträge:&nbsp;
                            {isLoadingArticles ? (
                                <LinearProgress />
                            ) : (
                                articlesData && articlesData.articles.length
                            )}
                        </em>
                    </DialogContentText>
                    {!categoryToDelete.isSidenav && (
                        <DialogContentText>
                            Unterkategorien, die dieser Kategorie zugeordnet
                            waren, werden zu Hauptkategorien.
                            <br />
                            <em>
                                Unterkategorien:&nbsp;
                                {
                                    categories.filter(
                                        (cat) =>
                                            cat.category &&
                                            cat.category.id ===
                                                categoryToDelete.id
                                    ).length
                                }
                            </em>
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={(e: React.MouseEvent) => onClose(e, 'auto')}
                        disabled={isLoading}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={() =>
                            deleteCategory({
                                variables: { id: categoryToDelete.id },
                            })
                        }
                        disabled={isLoading}
                    >
                        Kategorie endgültig löschen
                    </Button>
                </DialogActions>
            </ResponsiveFullScreenDialog>
        );
    }
);
