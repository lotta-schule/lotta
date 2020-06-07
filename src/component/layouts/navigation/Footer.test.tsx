import React from 'react';
import { render, cleanup, waitFor } from 'test/util';
import { MockedProvider } from '@apollo/client/testing';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';
import { Footer } from './Footer';
import { allCategories } from 'test/fixtures';

let categoriesHaveBeenFetched = false;
beforeEach(() => {
    categoriesHaveBeenFetched = false;
});
afterEach(cleanup);

describe('component/layouts/Footer', () => {

    it('should render the privacy link in the footer when there are no sidenav categories', async done => {
        const noSidenavCategoriesMock = [{
            request: { query: GetCategoriesQuery },
            result: () => {
                categoriesHaveBeenFetched = true;
                return {
                    data: {
                        categories: allCategories
                            .map(category => ({ ...category, isSidenav: false }))
                    }
                }
            }
        }];

        const { queryByTestId } = render(
            <MockedProvider mocks={noSidenavCategoriesMock}>
                <Footer />
            </MockedProvider>
        );
        await waitFor(() => {
            expect(categoriesHaveBeenFetched).toEqual(true);
        });
        const link = queryByTestId('SidenavLink');
        expect(link).not.toBeNull();
        expect(link).toHaveAttribute('href', '/privacy');
        done();
    });

    it('when present, should render sidenav category links next to privacy link', async done => {
        const sidenavCategoriesMock = [{
            request: { query: GetCategoriesQuery },
            result: { data: { categories: allCategories } }
        }];

        const { queryAllByTestId, queryByText } = render(
            <MockedProvider mocks={sidenavCategoriesMock}>
                <Footer />
            </MockedProvider>
        );

        await waitFor(() => {
            expect(queryAllByTestId('SidenavLink')).toHaveLength(3);
        });
        const sidenavLinks = queryAllByTestId('SidenavLink') as HTMLAnchorElement[];
        expect(sidenavLinks.find(l => l.getAttribute('href') === '/privacy')).toBeTruthy();
        expect(sidenavLinks.find(l => l.getAttribute('href') === '/c/4-Impressum')).toBeTruthy();
        expect(sidenavLinks.find(l => l.getAttribute('href') === '/c/5-Datenschutz')).toBeTruthy();
        
        done();
    });

});
