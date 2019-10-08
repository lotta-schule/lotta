import React, { memo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CategoryLayout } from 'component/layouts/CategoryLayout';
import { useCategory } from 'util/categories/useCategory';
import { useQuery } from 'react-apollo';
import { ArticleModel } from 'model';
import { GetArticlesQuery } from 'api/query/GetArticlesQuery';
import { EmptyLoadingLayout } from 'component/layouts/EmptyLoadingLayout';
import { ID } from 'model/ID';

export const CategoryRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const categoryId = Number(match.params.id);
    const category = useCategory(categoryId);

    const { data, loading: isLoading, error } = useQuery<{ articles: ArticleModel[] }, { categoryId: ID }>(GetArticlesQuery, { variables: { categoryId } });

    if (isLoading) {
        return (
            <EmptyLoadingLayout />
        );
    }

    if (error) {
        return (
            <div><span style={{ color: 'red' }}>{error.message}</span></div>
        );
    }

    if (!category) {
        return (
            <div><span style={{ color: 'red' }}>Seite nicht gefunden!</span></div>
        );
    }

    if (data) {
        const articles = !categoryId ?
            data.articles.filter(a => Boolean(a.category && !a.category.hideArticlesFromHomepage)) :
            data.articles;
        return (
            <CategoryLayout
                category={category}
                articles={articles}
            />
        )
    }

    return (
        <p>Keine Beiträge in dieser Kategorie.</p>
    );
});