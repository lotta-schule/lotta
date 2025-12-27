'use client';

import * as React from 'react';
import { Box, ErrorMessage } from '@lotta-schule/hubert';
import { ArticleModel } from 'model';
import { Header, Main, Sidebar } from 'layout';
import { ArticlesList } from 'shared/articlesList/ArticlesList';

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
