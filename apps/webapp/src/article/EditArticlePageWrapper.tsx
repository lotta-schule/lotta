'use client';
import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { ArticleModel } from '#/model/index.js';
import { EditArticlePageProps } from '#/article/EditArticlePage.js';
import dynamic from 'next/dynamic';

import GetArticleQuery from '#/api/query/GetArticleQuery.graphql';

const DynamicEditArticlePage = dynamic<EditArticlePageProps>(
  () => import('#/article/EditArticlePage.js'),
  {
    ssr: false,
  }
);

export const EditArticlePageWrapper = ({
  article: initialArticle,
}: {
  article: ArticleModel;
}) => {
  const { data } = useQuery(GetArticleQuery, {
    variables: { id: initialArticle.id },
  });

  return <DynamicEditArticlePage article={data?.article ?? initialArticle} />;
};
