'use client';

import * as React from 'react';
import { useQuery } from '@apollo/client';
import { ArticleModel, WidgetModel, ID, ArticleFilter } from 'model';
import { LegacyHeader, Main, Sidebar } from 'layout';
import { ErrorMessage, NoSsr, useScrollEvent } from '@lotta-schule/hubert';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import { WidgetsList } from './widgetsList/WidgetsList';
import { ArticlePreview } from 'article/preview';
import { useCategory } from 'util/categories/useCategory';
import { CategoryHead } from './CategoryHead';
import clsx from 'clsx';

const PREFETCH_COUNT = 10;

import GetCategoryWidgetsQuery from 'api/query/GetCategoryWidgetsQuery.graphql';
import GetArticlesQuery from 'api/query/GetArticlesQuery.graphql';

import styles from './CategoryPage.module.scss';

export interface CategoryPageProps {
  categoryId: ID | null;
}

export const CategoryPage = React.memo<CategoryPageProps>(({ categoryId }) => {
  const user = useCurrentUser();
  const category = useCategory(categoryId);
  const twoColumnsLayout = category?.layoutName === '2-columns';

  const [lastFetchedElementDate, setLastFetchedElementDate] = React.useState<
    string | null
  >(null);

  const FETCH_MORE_OFFSET =
    typeof window !== 'undefined' ? window.innerHeight / 2 || 512 : 0;

  const {
    data,
    error,
    loading: isLoading,
    fetchMore,
  } = useQuery<
    { articles: ArticleModel[] },
    { categoryId: ID | null; filter: ArticleFilter }
  >(GetArticlesQuery, {
    variables: { categoryId, filter: { first: PREFETCH_COUNT } },
    onCompleted: ({ articles }) => {
      if (articles.length < PREFETCH_COUNT) {
        const lastDate = [...articles].sort(
          (a1, a2) =>
            new Date(a1.updatedAt).getTime() - new Date(a2.updatedAt).getTime()
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
        Math.max(window.pageYOffset, document.documentElement.scrollTop) >
      document.documentElement.offsetHeight - FETCH_MORE_OFFSET
    ) {
      if (
        data?.articles &&
        data.articles.length > PREFETCH_COUNT - 1 &&
        !isLoading
      ) {
        const lastDate = [...(data?.articles ?? [])].sort(
          (a1, a2) =>
            new Date(a1.updatedAt).getTime() - new Date(a2.updatedAt).getTime()
        )[0].updatedAt;
        if (lastFetchedElementDate !== lastDate) {
          fetchMore({
            variables: {
              filter: {
                first: PREFETCH_COUNT,
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
                articles: [...data.articles, ...fetchMoreResult.articles],
              };
            },
          });
        }
      }
    }
  }, [FETCH_MORE_OFFSET, data, isLoading, lastFetchedElementDate, fetchMore]);

  const {
    data: widgetsData,
    error: widgetsError,
    loading: isWidgetsLoading,
  } = useQuery(GetCategoryWidgetsQuery, {
    variables: { categoryId: category?.id },
    skip: !category,
  });
  const widgets = (widgetsData?.widgets ?? []).filter((widget: WidgetModel) => {
    if (User.isAdmin(user)) {
      return !!user!.groups.find(
        (g) =>
          widget.groups.length < 1 ||
          !!widget.groups.find((cg) => cg.id === g.id)
      );
    }
    return true;
  });

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

  return (
    <>
      <CategoryHead category={category} />
      <Main>
        <LegacyHeader bannerImage={category.bannerImageFile || undefined}>
          <h2 data-testid="title">{category.title}</h2>
        </LegacyHeader>
        <div className={styles.articles}>
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
              <div
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
              </div>
            ))}
        </div>
      </Main>
      <Sidebar
        isEmpty={!widgetsError && !isWidgetsLoading && widgets.length < 1}
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
