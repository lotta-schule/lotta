import * as React from 'react';
import { render, waitFor } from 'test/util';
import { FaecherCategory, MaterialCategory } from 'test/fixtures';
import { CategorySelect } from './CategorySelect';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/editArticleLayout/CategorySelect', () => {
  it('should render the thing', () => {
    const screen = render(
      <CategorySelect
        selectedCategory={FaecherCategory}
        onSelectCategory={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /fächer/i })).toBeVisible();
  });

  it('should select the category', async () => {
    const fireEvent = userEvent.setup();
    const onSelectCategory = vi.fn();
    const screen = render(
      <CategorySelect
        selectedCategory={null}
        onSelectCategory={onSelectCategory}
      />
    );
    const select = screen.getByRole('button', { name: /wählen/i });
    await fireEvent.click(select);
    await fireEvent.click(
      await screen.findByRole('option', { name: /material/i })
    );
    expect(onSelectCategory).toHaveBeenCalledWith(MaterialCategory);
  });

  it('should set the label via the label prop', async () => {
    const screen = render(
      <CategorySelect
        label={'This is a Test-Label'}
        selectedCategory={null}
        onSelectCategory={() => {}}
      />
    );
    expect(
      screen.getByText('This is a Test-Label', { selector: 'span' })
    ).toBeVisible();
  });

  describe('option listing options', () => {
    it('show all categories as options', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <CategorySelect selectedCategory={null} onSelectCategory={() => {}} />
      );
      await fireEvent.click(screen.getByRole('button', { name: /wählen/i }));
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
      await fireEvent.click(screen.getByRole('button', { name: /wählen/i }));
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
      await fireEvent.click(screen.getByRole('button', { name: /wählen/i }));
      await waitFor(() => {
        expect(screen.getAllByRole('option')).toHaveLength(13);
      });
    });
  });
});
