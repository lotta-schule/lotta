import React from 'react';
import { render, cleanup, waitFor } from 'test/util';
import { SearchQuery } from 'api/query/SearchQuery';
import { ComputerExperten } from 'test/fixtures';
import userEvent from '@testing-library/user-event';
import SearchLayout from './SearchLayout';

afterEach(cleanup);

describe('component/layouts/SearchLayout', () => {

    describe('SearchLayout', () => {
        it('should render the search page', async () => {
            render(<SearchLayout />);
        });

        it('should have the correct title', () => {
            const { container } = render(<SearchLayout />);
            expect(container.querySelector('h2')).toHaveTextContent('Suche');
        });

        it('should issue a search request after typing', async () => {
            const { getByLabelText, getAllByTestId, getByText } = render(
                <SearchLayout />,
                {}, { additionalMocks: [{ request: { query: SearchQuery, variables: { searchText: 'Test' } }, result: { data: { results: [ComputerExperten] } } }] }
            );
            const searchInput = getByLabelText('Suchbegriff');
            await userEvent.type(searchInput, 'Test');
            await waitFor(() => {
                const articlePreviews = getAllByTestId('ArticlePreviewDensedLayout');
                expect(articlePreviews).toHaveLength(1);
                expect(getByText('Computerexperten')).not.toBeNull();
            });
        });

    });

});
