import * as React from 'react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useQuery } from '@apollo/client';
import { ArticleModel, ArticleFilter } from 'model';
import { CategoryLayout } from 'component/layouts/CategoryLayout';
import { useCategory } from 'util/categories/useCategory';
import { ID } from 'model/ID';
import { useScrollEvent } from 'util/useScrollEvent';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { getApolloClient } from 'api/client';
import { ArticleLayout } from 'component/layouts/ArticleLayout';
import GetArticlesQuery from 'api/query/GetArticlesQuery.graphql';
import GetArticleQuery from 'api/query/GetArticleQuery.graphql';

export const CategoryRoute = ({
    articles,
    categoryId,
    soloArticle,
}: Required<InferGetServerSidePropsType<typeof getServerSideProps>>) => {
    if (typeof window !== 'undefined') {
        getApolloClient().writeQuery({
            query: GetArticlesQuery,
            variables: {
                categoryId,
                filter: { first: 10 },
            },
            data: { articles },
        });
    }
    const category = useCategory(categoryId);
    const [lastFetchedElementDate, setLastFetchedElementDate] = React.useState<
        string | null
    >(null);

    const FETCH_MORE_OFFSET =
        typeof window !== 'undefined' ? window.innerHeight / 2 || 512 : 0;

    const nextFetchCount = React.useMemo(() => {
        if (typeof window === 'undefined') {
            return 0;
        }
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
            (category?.layoutName === '2-columns' && defaultElmHeight % 2 !== 0
                ? 1
                : 0)
        );
    }, [category]);

    const {
        data,
        error,
        loading: isLoading,
        fetchMore,
    } = useQuery<
        { articles: ArticleModel[] },
        { categoryId: ID | null; filter: ArticleFilter }
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

    const maybeFetchMoreArticles = React.useCallback(() => {
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
        FETCH_MORE_OFFSET,
        data,
        nextFetchCount,
        isLoading,
        lastFetchedElementDate,
        fetchMore,
    ]);

    useScrollEvent(maybeFetchMoreArticles, 250);

    if (soloArticle) {
        return <ArticleLayout article={soloArticle} />;
    }

    if (error) {
        return <ErrorMessage error={error} />;
    }

    if (!category) {
        return <ErrorMessage error={new Error('Seite nicht gefunden!')} />;
    }

    const loadedArticles = data?.articles ?? articles ?? [];
    const articlesToShow = !categoryId
        ? // Homepage
          loadedArticles.filter((a) =>
              Boolean(a.category && !a.category.hideArticlesFromHomepage)
          )
        : loadedArticles;

    return <CategoryLayout category={category} articles={articlesToShow} />;
};

export const getServerSideProps = async ({
    params,
    req,
}: GetServerSidePropsContext) => {
    if ((req as any).tenant === null) {
        return { props: {} };
    }
    const rawCategoryId = (params?.slug as string)?.replace(/^(\d+).*/, '$1');
    const categoryId = rawCategoryId === '0' ? null : rawCategoryId ?? null;
    let {
        data: { articles },
        error,
    } = await getApolloClient().query<
        { articles: ArticleModel[] },
        { categoryId: ID | null; filter: ArticleFilter }
    >({
        query: GetArticlesQuery,
        variables: {
            categoryId: categoryId ?? null,
            filter: { first: 10 },
        },
        context: {
            headers: req?.headers,
        },
    });

    let soloArticle = null;
    if (articles?.length === 1) {
        const {
            data: { article },
            error: soloArticleError,
        } = await getApolloClient().query<{ article: ArticleModel }>({
            query: GetArticleQuery,
            variables: {
                id: articles[0].id,
            },
            context: {
                headers: req?.headers,
            },
        });
        if (article) {
            soloArticle = article;
        }
        if (soloArticleError) {
            error = soloArticleError;
        }
    }

    return {
        props: {
            articles,
            soloArticle,
            categoryId,
            error: error ?? null,
        },
    };
};

export default CategoryRoute;
