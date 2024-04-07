import * as React from 'react';
import { render, waitFor } from 'test/util';
import {
  Weihnachtsmarkt,
  ComputerExperten,
  VivaLaRevolucion,
} from 'test/fixtures';
import { ArticlesByTag } from './ArticlesByTag';
import { FetchResult } from '@apollo/client';
import { ArticleModel } from 'model';

import GetArticlesForTag from 'api/query/GetArticlesForTagQuery.graphql';

describe('shared/article/ArticlesByTag', () => {
  const getAdditionalMocks = (
    result:
      | FetchResult<{ articles: ArticleModel[] }>
      | (() => FetchResult<{ articles: ArticleModel[] }>)
  ) => [
    {
      request: {
        query: GetArticlesForTag,
        variables: { tag: 'tag' },
      },
      result,
    },
  ];

  it('should render a ArticlesByTag without error', () => {
    render(
      <ArticlesByTag tag={'tag'} />,
      {},
      { additionalMocks: getAdditionalMocks({ data: { articles: [] } }) }
    );
  });

  describe('tag header', () => {
    it('should be visible when results are found', async () => {
      const screen = render(
        <ArticlesByTag tag={'tag'} />,
        {},
        {
          additionalMocks: getAdditionalMocks({
            data: { articles: [Weihnachtsmarkt] },
          }),
        }
      );
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tag/ })).toBeVisible();
      });
    });

    it('should not be shown when no results are found', async () => {
      const resFn = vi.fn(() => ({ data: { articles: [] } }));
      const screen = render(
        <ArticlesByTag tag={'tag'} />,
        {},
        {
          additionalMocks: getAdditionalMocks(resFn),
        }
      );
      await waitFor(() => {
        expect(resFn).toHaveBeenCalled();
      });
      expect(screen.queryByRole('heading', { name: /tag/i })).toBeNull();
    });
  });

  it('should render the articles found for a given tag', async () => {
    const resFn = vi.fn(() => ({
      data: {
        articles: [Weihnachtsmarkt, ComputerExperten, VivaLaRevolucion],
      },
    }));
    const screen = render(
      <ArticlesByTag tag={'tag'} />,
      {},
      {
        additionalMocks: getAdditionalMocks(resFn),
      }
    );

    await waitFor(() => {
      expect(resFn).toHaveBeenCalled();
    });

    expect(screen.queryAllByTestId('ArticlePreview')).toHaveLength(3);
  });
});
