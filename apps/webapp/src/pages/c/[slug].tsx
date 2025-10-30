import * as React from 'react';
import { trace } from '@opentelemetry/api';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { ArticleModel, ArticleFilter, ID } from 'model';
import { getApolloClient } from 'api/legacyClient';
import { CategoryPage } from 'category/CategoryPage';

import GetArticlesQuery from 'api/query/GetArticlesQuery.graphql';

export const PREFETCH_COUNT = 10;

const CategoryRoute = ({
  articles,
  categoryId,
}: Required<InferGetServerSidePropsType<typeof getServerSideProps>>) => {
  const didReadFromSSRCache = React.useRef(false);

  if (typeof window !== 'undefined' && didReadFromSSRCache.current === false) {
    getApolloClient().writeQuery({
      query: GetArticlesQuery,
      variables: {
        categoryId,
        filter: { first: PREFETCH_COUNT },
      },
      data: { articles },
    });

    didReadFromSSRCache.current = true;
  }
  return <CategoryPage categoryId={categoryId} />;
};

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  if ((req as any).tenant === null) {
    return { props: {} };
  }
  const rawCategoryId = (params?.slug as string)?.replace(/^(\d+).*/, '$1');
  const categoryId = rawCategoryId === '0' ? null : (rawCategoryId ?? null);

  const {
    data: { articles },
    error,
  } = await trace
    .getTracer('lotta-web')
    .startActiveSpan(
      `fetchCurrentCategoryPages::${categoryId ?? 'homepage'}`,
      async () =>
        getApolloClient().query<
          { articles: ArticleModel[] },
          { categoryId: ID | null; filter: ArticleFilter }
        >({
          query: GetArticlesQuery,
          variables: {
            categoryId: categoryId ?? null,
            filter: { first: PREFETCH_COUNT },
          },
          context: {
            headers: req?.headers,
          },
        })
    );

  return {
    props: {
      articles,
      categoryId,
      error: error ?? null,
    },
  };
};

export default CategoryRoute;
