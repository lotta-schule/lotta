import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Grid, NoSsr } from '@material-ui/core';
import { ArticleModel, WidgetModel, ID, ArticleFilter } from 'model';
import { Header, Main, Sidebar } from 'layout';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { File, User } from 'util/model';
import { useServerData } from 'shared/ServerDataContext';
import { WidgetsList } from './widgetsList/WidgetsList';
import { ArticlePreview } from 'article/preview';
import { useCategory } from 'util/categories/useCategory';
import { useScrollEvent } from 'util/useScrollEvent';
import { CategoryHead } from './CategoryHead';
import { PREFETCH_COUNT } from 'pages/c/[slug]';
import clsx from 'clsx';
import getConfig from 'next/config';

import GetCategoryWidgetsQuery from 'api/query/GetCategoryWidgetsQuery.graphql';
import GetArticlesQuery from 'api/query/GetArticlesQuery.graphql';

import styles from './CategoryPage.module.scss';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export interface CategoryPageProps {
    categoryId: ID | null;
}

export const CategoryPage = React.memo<CategoryPageProps>(({ categoryId }) => {
    const { baseUrl } = useServerData();
    const user = useCurrentUser();
    const category = useCategory(categoryId);
    const twoColumnsLayout = category?.layoutName === '2-columns';

    const [lastFetchedElementDate, setLastFetchedElementDate] = React.useState<
        string | null
    >(null);

    const FETCH_MORE_OFFSET =
        typeof window !== 'undefined' ? window.innerHeight / 2 || 512 : 0;

    const nextFetchCount = (() => {
        if (typeof window === 'undefined') {
            return PREFETCH_COUNT;
        }
        // calculate how much articles must be fetched by guessing how much article previews would fit by current screen size
        const defaultElmHeight = ((layoutName?: string | null) => {
            switch (layoutName) {
                case 'densed':
                    return 110;
                case '2-columns':
                    return 175;
                default:
                    return 300;
            }
        })(category?.layoutName);
        return (
            Math.round((1.25 * window.innerHeight) / defaultElmHeight) +
            (category?.layoutName === '2-columns' && defaultElmHeight % 2 !== 0
                ? 1
                : 0)
        );
    })();

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
                data?.articles &&
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

    const {
        data: widgetsData,
        error: widgetsError,
        loading: isWidgetsLoading,
    } = useQuery(GetCategoryWidgetsQuery, {
        variables: { categoryId: category?.id },
        skip: !category,
    });
    const widgets = (widgetsData?.widgets ?? []).filter(
        (widget: WidgetModel) => {
            if (User.isAdmin(user)) {
                return !!user!.groups.find(
                    (g) =>
                        widget.groups.length < 1 ||
                        !!widget.groups.find((cg) => cg.id === g.id)
                );
            }
            return true;
        }
    );

    useScrollEvent(maybeFetchMoreArticles, 250);

    if (error) {
        return <ErrorMessage error={error} />;
    }

    if (!category) {
        return <ErrorMessage error={new Error('Seite nicht gefunden!')} />;
    }

    const loadedArticles = data?.articles ?? [];
    const articlesToShow = !categoryId
        ? // Homepage
          loadedArticles.filter((a) =>
              Boolean(a.category && !a.category.hideArticlesFromHomepage)
          )
        : loadedArticles;

    const bannerImageUrl =
        (category.bannerImageFile &&
            `https://${cloudimageToken}.cloudimg.io/crop/950x120/foil1/${File.getFileRemoteLocation(
                baseUrl,
                category.bannerImageFile
            )}`) ||
        undefined;

    return (
        <>
            <CategoryHead category={category} />
            <Main>
                <Header bannerImageUrl={bannerImageUrl}>
                    <h2 data-testid="title">{category.title}</h2>
                </Header>
                <Grid container wrap={'wrap'} className={styles.articles}>
                    {[...articlesToShow]
                        .sort((a1, a2) => {
                            if (
                                !category.isHomepage &&
                                a1.isPinnedToTop !== a2.isPinnedToTop
                            ) {
                                if (a1.isPinnedToTop) {
                                    return -1;
                                }
                                if (a2.isPinnedToTop) {
                                    return 1;
                                }
                            }
                            return (
                                new Date(a2.updatedAt).getTime() -
                                new Date(a1.updatedAt).getTime()
                            );
                        })
                        .map((article) => (
                            <Grid
                                item
                                xs={twoColumnsLayout ? 6 : 12}
                                className={clsx(styles.gridItem, {
                                    [styles['two-columns']]: twoColumnsLayout,
                                })}
                                key={article.id}
                            >
                                <ArticlePreview
                                    article={article}
                                    limitedHeight
                                    layout={category.layoutName ?? 'standard'}
                                />
                            </Grid>
                        ))}
                </Grid>
            </Main>
            <Sidebar
                isEmpty={
                    !widgetsError && !isWidgetsLoading && widgets.length < 1
                }
            >
                {widgetsError && <ErrorMessage error={widgetsError} />}
                <NoSsr>
                    <WidgetsList widgets={widgets} />
                </NoSsr>
            </Sidebar>
        </>
    );
});
CategoryPage.displayName = 'CategoryPage';
