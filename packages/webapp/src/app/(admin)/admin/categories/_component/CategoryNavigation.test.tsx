import * as React from 'react';
import { render, waitFor, within } from 'test/util';
import { SplitViewProvider } from '@lotta-schule/hubert';
import { useParams, useRouter } from 'next/navigation';
import {
  allCategories,
  DatenschutzCategory,
  FaecherCategory,
  StartseiteCategory,
  MatheCategory,
} from 'test/fixtures';
import { CategoryNavigation } from './CategoryNavigation';
import userEvent from '@testing-library/user-event';
import { MockRouter } from 'test/mocks';
import { MockedFunction } from 'vitest';

const renderWithContext: typeof render = (children, ...other) => {
  return render(<SplitViewProvider>{children}</SplitViewProvider>, ...other);
};

describe('shared/layouts/adminLayout/categoryManagment/categories/CategoryNavigation', () => {
  const topLevelCategories = allCategories.filter((c) => !c.category);
  const router: MockRouter = useRouter() as any;

  afterEach(() => {
    router.reset('/');
  });

  it('should render all top-level-categories', async () => {
    const screen = renderWithContext(<CategoryNavigation />, {});
    await waitFor(() => {
      expect([
        ...screen
          .getAllByRole('button')
          .filter((el) => el.dataset.testid === 'main-category-item'),
        ...screen
          .getAllByRole('button')
          .filter((el) => el.dataset.testid === 'sidenav-category-item'),
      ]).toHaveLength(topLevelCategories.length);
    });
  });

  describe('selected category', () => {
    describe('select category', () => {
      it('should select a start category on click', async () => {
        const fireEvent = userEvent.setup();
        const screen = renderWithContext(<CategoryNavigation />, {});
        await waitFor(() => {
          expect(
            screen.getByRole('listitem', { name: /start/i })
          ).toBeVisible();
        });
        await fireEvent.click(screen.getByRole('listitem', { name: /start/i }));
        await waitFor(() => {
          expect(router._push).toHaveBeenCalledWith(
            `/admin/categories/${StartseiteCategory.id}`,
            `/admin/categories/${StartseiteCategory.id}`,
            undefined
          );
        });
      });

      it('should select a common category on click', async () => {
        const fireEvent = userEvent.setup();
        const screen = renderWithContext(<CategoryNavigation />, {});
        await waitFor(() => {
          expect(
            screen.getByRole('listitem', { name: /fächer/i })
          ).toBeVisible();
        });
        await fireEvent.click(
          screen.getByRole('listitem', { name: /fächer/i })
        );
        await waitFor(() => {
          expect(router._push).toHaveBeenCalledWith(
            `/admin/categories/${FaecherCategory.id}`,
            `/admin/categories/${FaecherCategory.id}`,
            undefined
          );
        });
      });

      it('should select a subcategory on click', async () => {
        const fireEvent = userEvent.setup();
        const screen = renderWithContext(<CategoryNavigation />, {});
        await waitFor(() => {
          expect(
            screen.getByRole('listitem', { name: /fächer/i })
          ).toBeVisible();
        });
        await fireEvent.click(
          screen.getByRole('listitem', { name: /fächer/i })
        );

        const expandButton = within(
          screen.getByRole('listitem', { name: /fächer/i })
        ).getByRole('button', { name: /unter/i });

        await fireEvent.click(expandButton);

        await waitFor(() => {
          expect(
            screen.getByRole('listitem', { name: /mathe/i })
          ).toBeVisible();
        });

        await fireEvent.click(screen.getByRole('listitem', { name: /mathe/i }));

        await waitFor(() => {
          expect(router._push).toHaveBeenCalledWith(
            `/admin/categories/${MatheCategory.id}`,
            `/admin/categories/${MatheCategory.id}`,
            undefined
          );
        });
      });

      it('should select a sidenav-category on click', async () => {
        const fireEvent = userEvent.setup();
        const screen = renderWithContext(<CategoryNavigation />, {});
        await waitFor(() => {
          expect(
            screen.getByRole('listitem', { name: /datenschutz/i })
          ).toBeVisible();
        });
        await fireEvent.click(
          screen.getByRole('listitem', { name: /datenschutz/i })
        );
        await waitFor(() => {
          expect(router._push).toHaveBeenCalledWith(
            `/admin/categories/${DatenschutzCategory.id}`,
            `/admin/categories/${DatenschutzCategory.id}`,
            undefined
          );
        });
      });
    });

    it('should show subtree when parent-tree is selected', async () => {
      const screen = renderWithContext(<CategoryNavigation />, {});
      (useParams as MockedFunction<typeof useParams>).mockReturnValue({
        categoryId: FaecherCategory.id,
      });
      await waitFor(() => {
        expect(
          screen.getByRole('listitem', {
            name: /mathe/i,
          })
        ).toBeVisible();
      });
    });

    it('should show sibblings and parent subtree is selected', async () => {
      const screen = renderWithContext(<CategoryNavigation />, {});
      (useParams as MockedFunction<typeof useParams>).mockReturnValue({
        categoryId: MatheCategory.id,
      });
      await waitFor(() => {
        expect(
          screen.getByRole('listitem', {
            name: /mathe/i,
          })
        ).toBeVisible();
      });
      await waitFor(() => {
        expect(
          screen.getByRole('listitem', {
            name: /fächer/i,
          })
        ).toBeVisible();
      });
    });
  });
});
