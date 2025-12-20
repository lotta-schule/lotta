import * as React from 'react';
import { render, waitFor } from 'test/util';
import { CategoryArticleRedirectSelection } from './CategoryArticleRedirectSelection';
import { ComputerExperten } from 'test/fixtures';
import { MockLink } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';

import SearchQuery from 'api/query/SearchQuery.graphql';
import GetArticleForPreviewQuery from 'api/query/GetArticleForPreviewQuery.graphql';

describe('administration/categories/categories/CategoryArticleRedirectSelection', () => {
  it('should show a search field and select an article', async () => {
    const fireEvent = userEvent.setup();
    const selectRedirectPath = vi.fn();
    const screen = render(
      <CategoryArticleRedirectSelection
        redirectPath={'/a/'}
        onSelectRedirectPath={selectRedirectPath}
      />,
      {},
      {
        additionalMocks: [
          ...['Test']
            .map((fullTerm) => {
              return new Array(fullTerm.length)
                .fill(null)
                .map((_, i) => fullTerm.slice(0, i + 1));
            })
            .flat()
            .map((searchText) => ({
              request: { query: SearchQuery, variables: { searchText } },
              result: { data: { results: [ComputerExperten] } },
            })),
        ],
      }
    );

    expect(
      screen.getByRole('combobox', {
        name: /beitrag als weiterleitungsziel/i,
      })
    ).toBeVisible();
    await fireEvent.type(
      screen.getByRole('combobox', {
        name: /beitrag als weiterleitungsziel/i,
      }),
      'Test'
    );
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: /Computerexperten/ })
      ).toBeVisible();
    });
    await fireEvent.click(
      screen.getByRole('option', { name: /Computerexperten/ })
    );

    await waitFor(() => {
      expect(selectRedirectPath).toHaveBeenCalledWith('/a/1-Computerexperten');
    });
  });

  describe('show the currently selected article', () => {
    const onFetchArticle = vi.fn(() => ({
      data: { article: ComputerExperten },
    }));
    const additionalMocks: MockLink.MockedResponse[] = [
      {
        request: {
          query: GetArticleForPreviewQuery,
          variables: { id: '1' },
        },
        result: onFetchArticle,
      },
    ];

    afterEach(() => {
      onFetchArticle.mockClear();
    });

    it('should show the path if article has not yet been loaded', async () => {
      const screen = render(
        <CategoryArticleRedirectSelection
          redirectPath={'/a/1-Computerexperten'}
          onSelectRedirectPath={vi.fn()}
        />,
        {},
        { additionalMocks }
      );
      await waitFor(() => {
        expect(screen.getByText(/\/a\/1-Computerexperten/)).toBeVisible();
      });
    });

    it('should not show info text when redirect path is default path ("/a/")', () => {
      const screen = render(
        <CategoryArticleRedirectSelection
          redirectPath={'/a/'}
          onSelectRedirectPath={vi.fn()}
        />,
        {},
        { additionalMocks }
      );
      expect(
        screen.queryByText(/kategorie wird .* weitergeleitet/i)
      ).toBeNull();
    });

    it('should show an ArticlePreview for the selected path', async () => {
      const screen = render(
        <CategoryArticleRedirectSelection
          redirectPath={'/a/1-Computerexperten'}
          onSelectRedirectPath={vi.fn()}
        />,
        {},
        { additionalMocks }
      );
      await waitFor(() => {
        expect(screen.getByText(/\/a\/1-Computerexperten/)).toBeVisible();
      });
      await waitFor(() => {
        expect(onFetchArticle).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(screen.getByTestId('ArticlePreview')).toBeVisible();
      });
      expect(screen.getByRole('heading')).toHaveTextContent('Computerexperten');
    });
  });
});
