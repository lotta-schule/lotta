'use client';

import * as React from 'react';
import { Box, ErrorMessage } from '@lotta-schule/hubert';
import { ArticleModel } from 'model';
import { LegacyHeader, Main, Sidebar } from 'layout';
import { ArticlesList } from 'shared/articlesList/ArticlesList';

export interface UnpublishedArticlesPageProps {
  articles: ArticleModel[];
  error?: Error | null;
}

export const UnpublishedArticlesPage = React.memo<UnpublishedArticlesPageProps>(
  ({ articles, error }) => {
    return (
      <>
        <Main>
          <LegacyHeader bannerImageUrl={'/bannerAdmin.png'}>
            <h2 data-testid="title">freizugebende Beiträge</h2>
          </LegacyHeader>
          <ErrorMessage error={error} />

          <Box>{articles && <ArticlesList articles={articles} />}</Box>
        </Main>
        <Sidebar isEmpty />
      </>
    );
  }
);
UnpublishedArticlesPage.displayName = 'AdminUnpublishedArticlesPage';
