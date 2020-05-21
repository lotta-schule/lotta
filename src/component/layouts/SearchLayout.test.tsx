import React from 'react';
import { render, cleanup } from 'test/util';
// import { MockedProvider } from '@apollo/client/testing';
// import { SearchQuery } from 'api/query/SearchQuery';
// import userEvent from '@testing-library/user-event';
import SearchLayout from './SearchLayout';

afterEach(cleanup);

describe('component/layouts/SearchLayout', () => {

    describe('SearchLayout', () => {
        it('should render the search page', async done => {
            render(<SearchLayout />);
            done();
        });

        // it('should issue a search request after typing', async done => {
        //     const { getByLabelText, findAllByTestId } = render(
        //         <MockedProvider mocks={[{ request: { query: SearchQuery, variables: { searchText: 'Test' } }, result: [{ id: 123 }] }]}>
        //             <SearchLayout />
        //         </MockedProvider>
        //     );
        //     const searchInput = getByLabelText('Suchbegriff');
        //     await userEvent.type(searchInput, 'Test');
        //     await new Promise(resolve => setTimeout(resolve, 500));
        //     const articlePreviews = findAllByTestId('ArticlePreview');
        //     expect(articlePreviews).toHaveLength(1);

        //     done();
        // });

    });

});