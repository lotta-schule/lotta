import * as React from 'react';
import { FaecherCategory, FrancaisCategory } from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { MockRouter } from 'test/mocks';
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
        'next/navigation'
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
      'next/navigation'
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
});
