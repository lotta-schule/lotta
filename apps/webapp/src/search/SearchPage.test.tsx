import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { ComputerExperten, FaecherCategory } from 'test/fixtures';
import { SearchPage } from './SearchPage';

import SearchQuery from 'api/query/SearchQuery.graphql';

describe('pages/search', () => {
  describe('Search', () => {
    it('should render the search page', async () => {
      const screen = render(<SearchPage />);
      expect(screen.container).toBeVisible();
    });

    it('should have the correct title', () => {
      const screen = render(<SearchPage />);
      expect(screen.container.querySelector('h2')).toHaveTextContent('Suche');
    });

    it('should issue a search request after typing', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <SearchPage />,
        {},
        {
          additionalMocks: [
            {
              request: {
                query: SearchQuery,
                variables: {
                  searchText: 'Test',
                  options: { categoryId: null },
                },
              },
              result: { data: { results: [ComputerExperten] } },
            },
          ],
        }
      );
      await fireEvent.type(screen.getByLabelText('Suchbegriff'), 'Test');
      await waitFor(() => {
        const articlePreviews = screen.getAllByTestId('ArticlePreview');
        expect(articlePreviews).toHaveLength(1);
        expect(screen.getByText('Computerexperten')).not.toBeNull();
      });
    });

    describe('filtering', () => {
      it('should open and close search filter', async () => {
        const fireEvent = userEvent.setup();
        const screen = render(<SearchPage />, {}, {});
        await waitFor(() => {
          expect(
            screen.getByTestId('advanced-search').getAttribute('aria-expanded')
          ).toEqual('false');
        });
        await fireEvent.click(
          screen.getByRole('button', { name: /erweitert/i })
        );
        await waitFor(() => {
          expect(
            screen.getByTestId('advanced-search').getAttribute('aria-expanded')
          ).toEqual('true');
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
        await fireEvent.click(
          screen.getByRole('button', { name: /erweitert/i })
        );
        await waitFor(() => {
          expect(
            screen.getByTestId('advanced-search').getAttribute('aria-expanded')
          ).toEqual('false');
        });
      });

      it('should add category to filteroptions', async () => {
        const fireEvent = userEvent.setup();
        const resultFn = vi.fn(() => ({
          data: { results: [ComputerExperten] },
        }));
        const screen = render(
          <SearchPage />,
          {},
          {
            additionalMocks: [
              {
                request: {
                  query: SearchQuery,
                  variables: {
                    searchText: 'Test',
                    options: {
                      categoryId: FaecherCategory.id,
                    },
                  },
                },
                result: resultFn,
              },
            ],
          }
        );
        await fireEvent.click(
          screen.getByRole('button', { name: /erweitert/i })
        );
        const categorySelect = await screen.findByRole('button', {
          name: /kategorie/i,
        });
        await fireEvent.click(categorySelect);
        const faecherOption = await screen.findByRole('option', {
          name: /fächer/i,
        });
        await fireEvent.click(faecherOption);
        await fireEvent.type(screen.getByLabelText('Suchbegriff'), 'Test');
        await waitFor(() => {
          expect(resultFn).toHaveBeenCalled();
        });
      });
    });
  });
});
