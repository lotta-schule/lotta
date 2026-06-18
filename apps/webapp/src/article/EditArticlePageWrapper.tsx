'use client';
import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { ArticleModel } from '#/model';
import { EditArticlePageProps } from '#/article/EditArticlePage';
import dynamic from 'next/dynamic.js';

import GetArticleQuery from '#/api/query/GetArticleQuery.graphql';

const DynamicEditArticlePage = dynamic<EditArticlePageProps>(
  () => import('#/article/EditArticlePage'),
  {
    ssr: false,
  }
);

export const EditArticlePageWrapper = ({
  article: initialArticle,
}: {
  article: ArticleModel;
}) => {
  const { data } = useQuery<{ article: ArticleModel }, { id: string }>(
    GetArticleQuery,
    {
      variables: { id: initialArticle.id },
    }
  );

  return <DynamicEditArticlePage article={data?.article ?? initialArticle} />;
};
