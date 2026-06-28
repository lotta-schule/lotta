import * as React from 'react';
import { render, within, waitFor } from '#/test/util';
import {
  ComputerExperten,
  VivaLaRevolucion,
  Schulfest,
  Weihnachtsmarkt,
  Klausurenplan,
} from '#/test/fixtures';
import { ArticlesPage } from './ArticlesPage';
import { GET_OWN_ARTICLES_QUERY } from './_graphql/GetOwnArticles';

describe('pages/profiles/articles', () => {
  it('should render a ProfileArticles without error', async () => {
    const articles = [
      Weihnachtsmarkt,
      Klausurenplan,
      Schulfest,
      VivaLaRevolucion,
      ComputerExperten,
    ];
    const screen = render(
      <ArticlesPage initialArticles={articles} error={null} />,
      {},
      {}
    );

    expect(screen.getByRole('heading')).toHaveTextContent(/beiträge/i);

    expect(screen.getByRole('table')).toBeVisible();

    const tbody = within(screen.getByRole('table')).queryAllByRole(
      'rowgroup'
    )[1];
    expect(within(tbody).getAllByRole('row')).toHaveLength(5);
  });

  it('does not fetch more articles on scroll when fewer than a full page was initially loaded', async () => {
    const articles = [Weihnachtsmarkt, Klausurenplan];
    const screen = render(
      <ArticlesPage initialArticles={articles} error={null} />,
      {},
      {}
    );

    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'offsetHeight', {
      value: 1200,
      configurable: true,
    });
    window.dispatchEvent(new Event('scroll'));

    // No mock is registered for the older-articles query. If the `hasMoreOlder`
    // guard (gated on the initial page being a full page) didn't suppress the
    // fetch, MockedProvider would throw on the unmatched request and fail this test.
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('fetches and appends older articles when scrolling near the bottom of a full initial page', async () => {
    const initialArticles = Array.from({ length: 50 }, (_, i) => ({
      ...Weihnachtsmarkt,
      id: `initial-${i}`,
      title: `Initial Article ${i}`,
      updatedAt: new Date(2024, 0, Math.abs(10 - i) % 10).toISOString(),
    }));
    const oldestInitialDate = initialArticles.at(-1)!.updatedAt;

    const olderArticle = {
      ...Klausurenplan,
      id: 'older-1',
      title: 'An Older Article',
      updatedAt: new Date(2023, 11, 1).toISOString(),
    };

    const mocks = [
      {
        request: {
          query: GET_OWN_ARTICLES_QUERY,
          variables: {
            filter: { first: 50, updatedBefore: oldestInitialDate },
          },
        },
        result: {
          data: { articles: [olderArticle] },
        },
      },
    ];

    const screen = render(
      <ArticlesPage initialArticles={initialArticles} error={null} />,
      {},
      { additionalMocks: mocks }
    );

    expect(screen.queryByText('An Older Article')).not.toBeInTheDocument();

    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'offsetHeight', {
      value: 1200,
      configurable: true,
    });
    window.dispatchEvent(new Event('scroll'));

    await waitFor(
      () => {
        expect(screen.getByText('An Older Article')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
