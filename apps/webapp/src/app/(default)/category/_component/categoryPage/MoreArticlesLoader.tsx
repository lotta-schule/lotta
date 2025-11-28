'use client';

import { useQuery } from '@apollo/client/react';
import * as React from 'react';
import { ArticlePreview } from 'article/preview/ArticlePreview';
import { useScrollEvent } from '@lotta-schule/hubert';
import { GET_ARTICLES_QUERY } from './_graphql/GET_ARTICLES_QUERY';
import clsx from 'clsx';

import styles from './CategoryPage.module.scss';

export type MoreArticlesLoaderProps = {
  lastArticleDate: string;
  layout: string;
  categoryId: string;
};

export const MoreArticlesLoader = React.memo(
  ({ lastArticleDate, categoryId, layout }: MoreArticlesLoaderProps) => {
    const FETCH_MORE_OFFSET =
      typeof window !== 'undefined' ? window.innerHeight / 2 || 512 : 0;
    const FETCH_COUNT = 10;
    const [shouldFetchEvenMore, setShouldFetchEvenMore] = React.useState(false);
    const {
      data,
      error,
      loading: isLoading,
    } = useQuery(GET_ARTICLES_QUERY, {
      variables: {
        categoryId,
        filter: {
          first: 10,
          updatedBefore: lastArticleDate,
        },
      },
    });

    const maybeFetchMoreArticles = React.useCallback(() => {
      if (
        window.innerHeight +
          Math.max(window.pageYOffset, document.documentElement.scrollTop) >
        document.documentElement.offsetHeight - FETCH_MORE_OFFSET
      ) {
        setShouldFetchEvenMore(true);
      }
    }, [FETCH_MORE_OFFSET]);

    useScrollEvent(maybeFetchMoreArticles, 250);

    const lastFetchedArticleDate = data?.articles?.at(-1)?.updatedAt;

    return (
      <>
        {data?.articles?.map((article) => (
          <div
            className={clsx(styles.gridItem, {
              [styles['two-columns']]: layout === '2-columns',
            })}
            key={article.id}
          >
            <ArticlePreview article={article} limitedHeight layout={layout} />
          </div>
        ))}
        {!isLoading &&
          shouldFetchEvenMore &&
          !error &&
          lastFetchedArticleDate &&
          data?.articles.length >= FETCH_COUNT && (
            <React.Suspense>
              <MoreArticlesLoader
                lastArticleDate={lastFetchedArticleDate}
                categoryId={categoryId}
                layout={layout}
              />
            </React.Suspense>
          )}
      </>
    );
  }
);
MoreArticlesLoader.displayName = 'MoreArticlesLoader';
