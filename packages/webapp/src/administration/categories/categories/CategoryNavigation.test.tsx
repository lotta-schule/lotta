import * as React from 'react';
import { render, waitFor } from 'test/util';
import {
  allCategories,
  FaecherCategory,
  MatheCategory,
  StartseiteCategory,
} from 'test/fixtures';
import { CategoryNavigation } from './CategoryNavigation';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/adminLayout/categoryManagment/categories/CategoryNavigation', () => {
  const topLevelCategories = allCategories.filter((c) => !c.category);

  it('should render an CategoryNavigation without error', () => {
    render(
      <CategoryNavigation
        selectedCategory={null}
        onSelectCategory={() => {}}
      />,
      {}
    );
  });

  it('should render all top-level-categories', async () => {
    const screen = render(
      <CategoryNavigation
        selectedCategory={null}
        onSelectCategory={() => {}}
      />,
      {}
    );
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
    it('should select a category on click', async () => {
      const fireEvent = userEvent.setup();
      let selectedCategory = null;
      const onSelectCategory = jest.fn(
        (category) => (selectedCategory = category)
      );
      const screen = render(
        <CategoryNavigation
          selectedCategory={null}
          onSelectCategory={onSelectCategory}
        />,
        {}
      );
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start/i })).toBeVisible();
      });
      await fireEvent.click(screen.getByRole('button', { name: /start/i }));
      await waitFor(() => {
        expect(onSelectCategory).toHaveBeenCalled();
      });
      expect(selectedCategory).toHaveProperty('id', StartseiteCategory.id);
    });

    it('should show subtree when parent-tree is selected', async () => {
      const screen = render(
        <CategoryNavigation
          selectedCategory={FaecherCategory}
          onSelectCategory={() => {}}
        />,
        {}
      );
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /fächer/i,
          })
        ).toBeVisible();
      });
    });

    it('should show expanded tree if selected category is in it', async () => {
      const screen = render(
        <CategoryNavigation
          selectedCategory={MatheCategory}
          onSelectCategory={() => {}}
        />,
        {}
      );
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /fächer/i,
          })
        ).toBeVisible();
      });
    });
  });
});
