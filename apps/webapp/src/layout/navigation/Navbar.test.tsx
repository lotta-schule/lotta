import * as React from 'react';
import { useRouter } from 'next/navigation.js';
import { allCategories, FaecherCategory } from '#/test/fixtures/index.js';
import { render, waitFor, within } from '#/test/util.js';
import { MockRouter } from '#/test/mocks/index.js';
import { Navbar } from './Navbar.js';

// eslint-disable-next-line react-hooks/rules-of-hooks
const mockRouter = useRouter() as unknown as MockRouter;

const mockRouterResetter = () => mockRouter.reset(`/c/${FaecherCategory.id}`);

describe('Navbar', () => {
  describe('it should render the correct amount', () => {
    afterEach(mockRouterResetter);
    it('of main categories', async () => {
      const screen = render(<Navbar categories={allCategories} />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });
    });

    it('of subcategories', async () => {
      mockRouterResetter();

      const screen = render(<Navbar categories={allCategories} />, {});
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Fächer' })).toBeVisible();
      });

      expect(
        within(screen.getByTestId('nav-level2')).getAllByRole('button')
      ).toHaveLength(6); // Fächer has 6 subcategories
    });
  });
});
