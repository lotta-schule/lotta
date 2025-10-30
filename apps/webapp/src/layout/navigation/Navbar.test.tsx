import * as React from 'react';
import {
  FaecherCategory,
  FrancaisCategory,
  allCategories,
} from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { MockRouter } from 'test/mocks';
import { MockedProvider } from '@apollo/client/testing';
import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  describe('it should render the correct amount', () => {
    it('of main categories', async () => {
      const screen = render(<Navbar />);

      await waitFor(async () => {
        expect(
          screen
            .queryAllByRole('button')
            .filter(
              (button) =>
                button.getAttribute('data-testid') !== 'MobileMenuButton'
            )
        ).toHaveLength(4);
      });
    });

    it('of subcategories', async () => {
      const { mockRouter } = await vi.importMock<{ mockRouter: MockRouter }>(
        'next/router'
      );
      mockRouter.reset(`/c/${FaecherCategory.id}`);

      const screen = render(<Navbar />, {});
      await waitFor(async () => {
        expect(
          screen
            .queryAllByRole('button')
            .filter(
              (button) =>
                button.getAttribute('data-testid') !== 'MobileMenuButton'
            )
        ).toHaveLength(10);
      });
    });
  });

  // Problems mocking scrollIntoView
  it('should scroll to active nav item', async () => {
    const { mockRouter } = await vi.importMock<{ mockRouter: MockRouter }>(
      'next/router'
    );
    mockRouter.reset(`/c/${FaecherCategory.id}`);
    const screen = render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByTestId('nav-level2')).toHaveProperty('scrollLeft', 0);
    });

    mockRouter.push(`/c/${FrancaisCategory.id}`);

    await waitFor(() => {
      expect(Element.prototype.scroll).toHaveBeenCalled();
    });
  });

  it('should open external category redirects in a new tab', async () => {
    let categoriesHaveBeenFetched = false;
    const externalCategoryMock = [
      {
        request: { query: GetCategoriesQuery },
        result: () => {
          categoriesHaveBeenFetched = true;
          return {
            data: {
              categories: [
                ...allCategories.map((cat) => ({
                  ...cat,
                  isSidenav: false,
                  isHomepage: false,
                })),
                {
                  id: '2000',
                  sortKey: 99,
                  title: 'External Link',
                  isHomepage: false,
                  isSidenav: false,
                  hideArticlesFromHomepage: false,
                  bannerImageFile: null,
                  category: null,
                  layoutName: null,
                  redirect: 'https://lotta.schule',
                  groups: [],
                },
              ],
            },
          };
        },
      },
    ];

    const screen = render(
      <MockedProvider mocks={externalCategoryMock}>
        <Navbar />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(categoriesHaveBeenFetched).toEqual(true);
    });

    const link = screen.queryByRole('link', { name: /external link/i });
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('href', 'https://lotta.schule');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
