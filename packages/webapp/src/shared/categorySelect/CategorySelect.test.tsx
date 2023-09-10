import * as React from 'react';
import { render, waitFor } from 'test/util';
import { FaecherCategory, MaterialCategory } from 'test/fixtures';
import { CategorySelect } from './CategorySelect';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/editArticleLayout/CategorySelect', () => {
  it('should render the shared', () => {
    render(
      <CategorySelect
        selectedCategory={FaecherCategory}
        onSelectCategory={() => {}}
      />
    );
  });

  it('should select the category', async () => {
    const fireEvent = userEvent.setup();
    const onSelectCategory = jest.fn();
    const screen = render(
      <CategorySelect
        selectedCategory={null}
        onSelectCategory={onSelectCategory}
      />
    );
    await fireEvent.selectOptions(
      screen.getByRole('combobox', { name: /wählen/i }),
      await screen.findByRole('option', { name: /material/i })
    );
    expect(onSelectCategory).toHaveBeenCalledWith(MaterialCategory);
  });

  it('should set the label via the label prop', async () => {
    const screen = render(
      <CategorySelect
        label={'Label'}
        selectedCategory={null}
        onSelectCategory={() => {}}
      />
    );
    expect(screen.getByText('Label')).toBeVisible();
  });

  describe('option listing options', () => {
    it('show all categories as options', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <CategorySelect selectedCategory={null} onSelectCategory={() => {}} />
      );
      await fireEvent.click(screen.getByRole('combobox', { name: /wählen/i }));
      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(15);
      });
    });

    it('show all categories as options', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <CategorySelect selectedCategory={null} onSelectCategory={() => {}} />
      );
      await fireEvent.click(screen.getByRole('combobox', { name: /wählen/i }));
      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(15);
      });
    });

    it('should not show subcategories if hideSubCategories is given', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <CategorySelect
          hideSubCategories
          selectedCategory={null}
          onSelectCategory={() => {}}
        />
      );
      await fireEvent.click(screen.getByRole('combobox', { name: /wählen/i }));
      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(5);
      });
    });

    it('should not show sidenav categories if hideSidenav is given', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <CategorySelect
          hideSidenav
          selectedCategory={null}
          onSelectCategory={() => {}}
        />
      );
      await fireEvent.click(screen.getByRole('combobox', { name: /wählen/i }));
      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(13);
      });
    });
  });
});
