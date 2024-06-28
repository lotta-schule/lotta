import * as React from 'react';
import { render, waitFor } from 'test/util';
import { Schulfest, Weihnachtsmarkt } from 'test/fixtures';
import { ArticlePage } from './ArticlePage';

import GetArticlesForTag from 'api/query/GetArticlesForTagQuery.graphql';

const additionalMocks = [
  {
    request: {
      query: GetArticlesForTag,
      variables: { tag: 'La Revolucion' },
    },
    result: { data: { articles: [Weihnachtsmarkt] } },
  },
];

describe('shared/article/ArticleLayout', () => {
  it('should show the correct title', async () => {
    const screen = render(
      <ArticlePage article={Schulfest} title={Schulfest.title} />
    );
    expect(screen.getByRole('heading', { name: 'Schulfest' })).toBeVisible();
  });

  it('should show the article component', async () => {
    const screen = render(
      <ArticlePage article={Schulfest} title={Schulfest.title} />
    );
    expect(screen.getByTestId('Article')).toBeVisible();
  });

  it('should show related articles', async () => {
    const screen = render(
      <ArticlePage article={Schulfest} title={Schulfest.title} />,
      {},
      { additionalMocks }
    );
    await waitFor(() => {
      expect(screen.getByTestId('ArticlesByTag')).toBeVisible();
    });
  });
});
