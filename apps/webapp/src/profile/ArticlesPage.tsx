'use client';

import * as React from 'react';
import { Box, ErrorMessage, useScrollEvent } from '@lotta-schule/hubert';
import { useApolloClient } from '@apollo/client/react';
import uniqBy from 'lodash/uniqBy';
import { ResultOf } from '#/api/graphql';
import { Header, Main, Sidebar } from '#/layout';
import { ArticlesList } from '#/shared/articlesList/ArticlesList';
import {
  GET_OWN_ARTICLES_QUERY,
  OWN_ARTICLES_PAGE_SIZE,
} from './_graphql/GetOwnArticles';

export interface ArticlesPageProps {
  initialArticles: ResultOf<typeof GET_OWN_ARTICLES_QUERY>['articles'];
  error?: Error | null;
}

type Article = NonNullable<
  NonNullable<ResultOf<typeof GET_OWN_ARTICLES_QUERY>['articles']>[number]
>;

export const ArticlesPage = React.memo(
  ({ initialArticles, error }: ArticlesPageProps) => {
    const apolloClient = useApolloClient();

    const [olderArticles, setOlderArticles] = React.useState<Article[]>([]);
    const [isLoadingOlder, setIsLoadingOlder] = React.useState(false);
    const [hasMoreOlder, setHasMoreOlder] = React.useState(
      (initialArticles?.length ?? 0) >= OWN_ARTICLES_PAGE_SIZE
    );

    const articles = React.useMemo(
      () =>
        uniqBy(
          [...(initialArticles ?? []), ...olderArticles].filter(
            (article): article is Article => article !== null
          ),
          'id'
        ),
      [initialArticles, olderArticles]
    );

    const loadOlderArticles = React.useCallback(async () => {
      const lastArticleDate = articles.at(-1)?.updatedAt;
      if (!lastArticleDate || isLoadingOlder || !hasMoreOlder) {
        return;
      }
      setIsLoadingOlder(true);
      try {
        const { data } = await apolloClient.query({
          query: GET_OWN_ARTICLES_QUERY,
          variables: {
            filter: {
              first: OWN_ARTICLES_PAGE_SIZE,
              updatedBefore: lastArticleDate,
            },
          },
          fetchPolicy: 'network-only',
        });
        const fetched = (data?.articles ?? []).filter(
          (article): article is Article => article !== null
        );
        setHasMoreOlder(fetched.length === OWN_ARTICLES_PAGE_SIZE);
        if (fetched.length) {
          setOlderArticles((current) => uniqBy([...current, ...fetched], 'id'));
        }
      } finally {
        setIsLoadingOlder(false);
      }
    }, [apolloClient, articles, hasMoreOlder, isLoadingOlder]);

    const maybeLoadOlderArticles = React.useCallback(() => {
      const FETCH_MORE_OFFSET = window.innerHeight / 2 || 512;
      if (
        window.innerHeight +
          Math.max(window.pageYOffset, document.documentElement.scrollTop) >
        document.documentElement.offsetHeight - FETCH_MORE_OFFSET
      ) {
        loadOlderArticles();
      }
    }, [loadOlderArticles]);

    useScrollEvent(maybeLoadOlderArticles, 250);

    return (
      <>
        <Main>
          <Header bannerImageUrl={'/bannerProfil.png'}>
            <h2>Meine Beiträge</h2>
          </Header>

          <Box>
            <ErrorMessage error={error} />
            {!!articles.length && <ArticlesList articles={articles} />}
          </Box>
        </Main>
        <Sidebar isEmpty />
      </>
    );
  }
);
ArticlesPage.displayName = 'ProfileArticlesPage';
