import React, { memo, useCallback, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ArticleModel, ArticleFilter } from 'model';
import { GetArticlesQuery } from 'api/query/GetArticlesQuery';
import { CategoryLayout } from 'component/layouts/CategoryLayout';
import { useCategory } from 'util/categories/useCategory';
import { EmptyLoadingLayout } from 'component/layouts/EmptyLoadingLayout';
import { ID } from 'model/ID';
import { useScrollEvent } from 'util/useScrollEvent';
import { useCategories } from 'util/categories/useCategories';
import { ErrorMessage } from 'component/general/ErrorMessage';

export const CategoryRoute = memo<RouteComponentProps<{ id: string }>>(
    ({ match }) => {
        const categoryId = match.params.id?.replace(/^(\d+).*/, '$1'); // take only first digits
        const category = useCategory(categoryId);
        const [, { loading: isLoadingCategories }] = useCategories();
        const [lastFetchedElementDate, setLastFetchedElementDate] = useState<
            string | null
        >(null);

        const FETCH_MORE_OFFSET = window.innerHeight / 2 || 512;

        const nextFetchCount = useMemo(() => {
            // calculate how much articles must be fetched by guessing how much article previews would fit by current screen size
            const defaultElmHeight = ((layoutName?: string | null) => {
                switch (layoutName) {
                    case 'densed':
                        return 75;
                    case '2-columns':
                        return 125;
                    default:
                        return 250;
                }
            })(category?.layoutName);
            return (
                Math.round((1.5 * window.innerHeight) / defaultElmHeight) +
                (category?.layoutName === '2-columns' &&
                defaultElmHeight % 2 !== 0
                    ? 1
                    : 0)
            );
        }, [category]);

        const { data, loading: isLoading, error, fetchMore, called } = useQuery<
            { articles: ArticleModel[] },
            { categoryId: ID; filter: ArticleFilter }
        >(GetArticlesQuery, {
            variables: { categoryId, filter: { first: nextFetchCount } },
            onCompleted: ({ articles }) => {
                if (articles.length < nextFetchCount) {
                    const lastDate = [...articles].sort(
                        (a1, a2) =>
                            new Date(a1.updatedAt).getTime() -
                            new Date(a2.updatedAt).getTime()
                    )[0]?.updatedAt;
                    if (lastDate) {
                        setLastFetchedElementDate(lastDate);
                    }
                }
            },
        });

        const maybeFetchMoreArticles = useCallback(() => {
            if (
                window.innerHeight +
                    Math.max(
                        window.pageYOffset,
                        document.documentElement.scrollTop
                    ) >
                document.documentElement.offsetHeight - FETCH_MORE_OFFSET
            ) {
                if (
                    data &&
                    data.articles &&
                    data.articles.length > nextFetchCount - 1 &&
                    !isLoading
                ) {
                    const lastDate = [...(data?.articles ?? [])].sort(
                        (a1, a2) =>
                            new Date(a1.updatedAt).getTime() -
                            new Date(a2.updatedAt).getTime()
                    )[0].updatedAt;
                    if (lastFetchedElementDate !== lastDate) {
                        try {
                            fetchMore({
                                variables: {
                                    filter: {
                                        first: nextFetchCount,
                                        updated_before: lastDate,
                                    },
                                },
                                updateQuery: (
                                    prev: { articles: ArticleModel[] },
                                    { fetchMoreResult }
                                ) => {
                                    if (!fetchMoreResult) {
                                        return prev;
                                    }
                                    setLastFetchedElementDate(lastDate);
                                    return {
                                        ...prev,
                                        articles: [
                                            ...data.articles,
                                            ...fetchMoreResult.articles,
                                        ],
                                    };
                                },
                            });
                        } catch {}
                    }
                }
            }
        }, [
            data,
            fetchMore,
            isLoading,
            lastFetchedElementDate,
            nextFetchCount,
            FETCH_MORE_OFFSET,
        ]);

        useScrollEvent(maybeFetchMoreArticles, 250);

        if (!called || isLoading || isLoadingCategories) {
            return <EmptyLoadingLayout />;
        }

        if (error) {
            return <ErrorMessage error={error} />;
        }

        if (!category) {
            return <ErrorMessage error={new Error('Seite nicht gefunden!')} />;
        }

        if (data) {
            const articles = !categoryId
                ? data.articles.filter((a) =>
                      Boolean(
                          a.category && !a.category.hideArticlesFromHomepage
                      )
                  )
                : data.articles;
            return <CategoryLayout category={category} articles={articles} />;
        }

        return null;
    }
);
export default CategoryRoute;
