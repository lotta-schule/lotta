import * as React from 'react';
import { render, waitFor } from 'test/util';
import { MockedProvider } from '@apollo/client/testing';
import { Footer } from './Footer';
import { allCategories } from 'test/fixtures';
import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';

describe('shared/layouts/Footer', () => {
  let categoriesHaveBeenFetched = false;
  beforeEach(() => {
    categoriesHaveBeenFetched = false;
  });

  it('should render the privacy link in the footer when there are no sidenav categories', async () => {
    const noSidenavCategoriesMock = [
      {
        request: { query: GetCategoriesQuery },
        result: () => {
          categoriesHaveBeenFetched = true;
          return {
            data: {
              categories: allCategories.map((category) => ({
                ...category,
                isSidenav: false,
              })),
            },
          };
        },
      },
    ];

    const screen = render(
      <MockedProvider mocks={noSidenavCategoriesMock}>
        <Footer />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(categoriesHaveBeenFetched).toEqual(true);
    });
    const link = screen.queryByTestId('SidenavLink');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('href', '/privacy');
  });

  it('when present, should render sidenav category links next to privacy link', async () => {
    const sidenavCategoriesMock = [
      {
        request: { query: GetCategoriesQuery },
        result: { data: { categories: allCategories } },
      },
    ];

    const screen = render(
      <Footer />,
      {},
      { additionalMocks: sidenavCategoriesMock }
    );

    await waitFor(() => {
      expect(screen.queryAllByTestId('SidenavLink')).toHaveLength(3);
    });
    const sidenavLinks = screen.queryAllByTestId(
      'SidenavLink'
    ) as HTMLAnchorElement[];
    expect(
      sidenavLinks.find((l) => l.getAttribute('href') === '/privacy')
    ).toBeTruthy();
    expect(
      sidenavLinks.find((l) => l.getAttribute('href') === '/c/4-Impressum')
    ).toBeTruthy();
    expect(
      sidenavLinks.find((l) => l.getAttribute('href') === '/c/5-Datenschutz')
    ).toBeTruthy();
  });

  it('A sidenav category leading to an external site should be set accordingly', async () => {
    const noSidenavCategoriesMock = [
      {
        request: { query: GetCategoriesQuery },
        result: () => {
          categoriesHaveBeenFetched = true;
          return {
            data: {
              categories: [
                ...allCategories,
                {
                  id: '1999',
                  sortKey: 0,
                  title: 'External',
                  isHomepage: false,
                  isSidenav: true,
                  hideArticlesFromHomepage: false,
                  bannerImageFile: null,
                  category: null,
                  layoutName: null,
                  redirect: 'https://google.com',
                  groups: [],
                },
              ],
            },
          };
        },
      },
    ];

    const screen = render(
      <MockedProvider mocks={noSidenavCategoriesMock}>
        <Footer />
      </MockedProvider>
    );
    await waitFor(() => {
      expect(categoriesHaveBeenFetched).toEqual(true);
    });
    const link = screen.queryByRole('link', { name: /external/i });
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('href', 'https://google.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
