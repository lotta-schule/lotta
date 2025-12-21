import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FaecherCategory } from 'test/fixtures';
import { render, waitFor, within } from 'test/util';
import { MockRouter } from 'test/mocks';
import { Navbar } from './Navbar';

// eslint-disable-next-line react-hooks/rules-of-hooks
const mockRouter = useRouter() as unknown as MockRouter;

const mockRouterResetter = () => mockRouter.reset(`/c/${FaecherCategory.id}`);

describe('Navbar', () => {
  describe('it should render the correct amount', () => {
    afterEach(mockRouterResetter);
    it('of main categories', async () => {
      const screen = render(<Navbar />);

      await waitFor(() => {
        expect(screen.getAllByRole('button')).toHaveLength(3);
      });
    });

    it('of subcategories', async () => {
      mockRouterResetter();

      const screen = render(<Navbar />, {});
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Fächer' })).toBeVisible();
      });

      expect(
        within(screen.getByTestId('nav-level2')).getAllByRole('button')
      ).toHaveLength(6); // Fächer has 6 subcategories
    });
  });
});
