import React, { memo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { ArticleModel, ArticleFilter } from 'model';
import { GetArticlesQuery } from 'api/query/GetArticlesQuery';
import { CategoryLayout } from 'component/layouts/CategoryLayout';
import { useCategory } from 'util/categories/useCategory';
import { EmptyLoadingLayout } from 'component/layouts/EmptyLoadingLayout';
import { ID } from 'model/ID';
import { useScrollEvent } from 'util/useScrollEvent';
import { useCategories } from 'util/categories/useCategories';
import { ErrorMessage } from 'component/general/ErrorMessage';

export const CategoryRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const categoryId = parseInt(match.params.id);
    const category = useCategory(categoryId);
    const [, { loading: isLoadingCategories }] = useCategories();
    const [lastFetchedElementDate, setLastFetchedElementDate] = useState<string | null>(null);

    const FETCH_MORE_OFFSET = window.innerHeight || 1024;
    const FETCH_COUNT = 25;

    const { data, loading: isLoading, error, fetchMore, called } = useQuery<{ articles: ArticleModel[] }, { categoryId: ID, filter: ArticleFilter }>(
        GetArticlesQuery,
        {
            variables: { categoryId, filter: { first: FETCH_COUNT } }
        },
    );

    useScrollEvent(() => {
        if (window.innerHeight + Math.max(window.pageYOffset, document.documentElement.scrollTop) > document.documentElement.offsetHeight - FETCH_MORE_OFFSET) {
            if (data && data.articles && data.articles.length > FETCH_COUNT - 1 && !isLoading) {
                const lastDate = data && data.articles
                    .sort((a1, a2) => new Date(a1.updatedAt).getTime() - new Date(a2.updatedAt).getTime())[0].updatedAt;
                if (lastFetchedElementDate !== lastDate) {
                    try {
                        fetchMore({
                            variables: { filter: { first: FETCH_COUNT, updated_before: lastDate } },
                            updateQuery: (prev: { articles: ArticleModel[] }, { fetchMoreResult }) => {
                                if (!fetchMoreResult) return prev;
                                const fetchedArticles = fetchMoreResult.articles;
                                if (fetchedArticles && fetchedArticles.length) {
                                    setLastFetchedElementDate(lastDate);
                                }
                                return {
                                    ...prev,
                                    articles: [...data.articles, ...fetchMoreResult.articles]
                                };
                            },

                        });
                    } catch {}
                }
            }
        }
    }, 250, [data, fetchMore, isLoading, lastFetchedElementDate]);

    if (!called || isLoading || isLoadingCategories) {
        return (
            <EmptyLoadingLayout />
        );
    }

    if (error) {
        return (
            <ErrorMessage error={error} />
        );
    }

    if (!category) {
        return (
            <ErrorMessage error={new Error('Seite nicht gefunden!')} />
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
