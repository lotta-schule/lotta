import React from 'react';
import { render, waitFor } from 'test/util';
import { SearchQuery } from 'api/query/SearchQuery';
import { ComputerExperten } from 'test/fixtures';
import userEvent from '@testing-library/user-event';
import SearchLayout from './SearchLayout';

describe('component/layouts/SearchLayout', () => {

    describe('SearchLayout', () => {
        it('should render the search page', async () => {
            render(<SearchLayout />);
        });

        it('should have the correct title', () => {
            const screen = render(<SearchLayout />);
            expect(screen.container.querySelector('h2')).toHaveTextContent('Suche');
        });

        it('should issue a search request after typing', async () => {
            const screen = render(
                <SearchLayout />,
                {}, { additionalMocks: [{ request: { query: SearchQuery, variables: { searchText: 'Test' } }, result: { data: { results: [ComputerExperten] } } }] }
            );
            const searchInput = screen.getByLabelText('Suchbegriff');
            userEvent.type(searchInput, 'Test');
            await waitFor(() => {
                const articlePreviews = screen.getAllByTestId('ArticlePreviewDensedLayout');
                expect(articlePreviews).toHaveLength(1);
                expect(screen.getByText('Computerexperten')).not.toBeNull();
            });
        });

    });

});
