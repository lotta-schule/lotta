'use client';

import * as React from 'react';
import { Box, ErrorMessage } from '@lotta-schule/hubert';
import { ArticleModel } from '#/model/index.js';
import { Header, Main, Sidebar } from '#/layout/index.js';
import { ArticlesList } from '#/shared/articlesList/ArticlesList.js';

export interface ArticlesPageProps {
  articles: ArticleModel[];
  error?: Error | null;
}

export const ArticlesPage = React.memo(
  ({ articles, error }: ArticlesPageProps) => {
    return (
      <>
        <Main>
          <Header bannerImageUrl={'/bannerProfil.png'}>
            <h2>Meine Beiträge</h2>
          </Header>

          <Box>
            <ErrorMessage error={error} />
            {articles && <ArticlesList articles={articles} />}
          </Box>
        </Main>
        <Sidebar isEmpty />
      </>
    );
  }
);
ArticlesPage.displayName = 'ProfileArticlesPage';
