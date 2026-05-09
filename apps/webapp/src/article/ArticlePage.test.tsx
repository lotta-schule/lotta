import { render, waitFor } from '#/test/util.js';
import { Schulfest, Weihnachtsmarkt } from '#/test/fixtures/index.js';
import { ArticlePage } from './ArticlePage.js';

import GetArticlesForTag from '#/api/query/GetArticlesForTagQuery.graphql';

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
  it('should show the article component', async () => {
    const screen = render(
      <ArticlePage article={Schulfest} title={Schulfest.title} />,
      {},
      { additionalMocks }
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
