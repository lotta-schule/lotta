import * as React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ArticleModel, CategoryModel, ID } from 'model';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    ErrorMessage,
    LinearProgress,
} from '@lotta-schule/hubert';
import { useCategories } from 'util/categories/useCategories';

import DeleteCategoryMutation from 'api/mutation/DeleteCategoryMutation.graphql';
import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
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
            <Dialog
                open={isOpen}
                onRequestClose={onRequestClose}
                title={'Kategorie löschen'}
            >
                {isLoading && (
                    <LinearProgress
                        isIndeterminate
                        label={'Kategorie wird gelöscht'}
                    />
                )}
                <DialogContent>
                    <ErrorMessage error={error} />
                    <p>
                        Möchtest du die folgende Kategorie wirklich löschen? Sie
                        ist dann unwiederbringlich verloren.
                    </p>
                    <p>
                        Alle Beiträge, die dieser Kategorie zugeordnet sind,
                        sind dann ohne Kategorie und nur über direkten Link
                        erreichbar.
                    </p>
                    {isLoadingArticles ? (
                        <LinearProgress
                            isIndeterminate
                            label={'Beiträge werden geladen'}
                        />
                    ) : (
                        <em>Beiträge: {articlesData?.articles.length ?? 0}</em>
                    )}
                    {!categoryToDelete.isSidenav && (
                        <p>
                            Unterkategorien, die dieser Kategorie zugeordnet
                            waren, werden in die Hauptnavigation einsortiert.
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
            </Dialog>
        );
    }
);
DeleteCategoryDialog.displayName = 'DeleteCategoryDialog';
