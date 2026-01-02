import * as React from 'react';
import { render, waitFor } from 'test/util';
import {
  Weihnachtsmarkt,
  ComputerExperten,
  VivaLaRevolucion,
  SomeUser,
} from 'test/fixtures';
import { ArticlesByUser } from './ArticlesByUser';
import { ApolloLink } from '@apollo/client';
import { ArticleModel } from 'model';

import GetArticlesByUser from 'api/query/GetArticlesByUserQuery.graphql';

describe('shared/article/ArticlesByUser', () => {
  const getAdditionalMocks = (
    result:
      | ApolloLink.Result<{ articles: ArticleModel[] }>
      | (() => ApolloLink.Result<{ articles: ArticleModel[] }>)
  ) => [
    {
      request: {
        query: GetArticlesByUser,
        variables: { userId: SomeUser.id },
      },
      result,
    },
  ];

  it('should render a ArticlesByUser without articles', async () => {
    const resFn = vi.fn(() => ({
      data: {
        articles: [],
      },
    }));
    const screen = render(
      <ArticlesByUser user={SomeUser} />,
      {},
      { additionalMocks: getAdditionalMocks(resFn) }
    );
    await waitFor(() => {
      expect(resFn).toHaveBeenCalled();
    });

    expect(screen.queryAllByTestId('ArticlePreview')).toHaveLength(0);
  });

  it('should render the articles found for a given user', async () => {
    const resFn = vi.fn(() => ({
      data: {
        articles: [Weihnachtsmarkt, ComputerExperten, VivaLaRevolucion],
      },
    }));
    const screen = render(
      <ArticlesByUser user={SomeUser} />,
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
