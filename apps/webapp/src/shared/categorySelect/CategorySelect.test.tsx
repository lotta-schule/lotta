import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import { FaecherCategory, MaterialCategory } from 'test/fixtures';
import { CategorySelect } from './CategorySelect';

describe('shared/layouts/editArticleLayout/CategorySelect', () => {
  it('should render the thing', async () => {
    const screen = render(
      <CategorySelect
        selectedCategory={FaecherCategory}
        onSelectCategory={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /fächer/i })).toBeVisible();
    });
  });

  it('should select the category', async () => {
    const user = userEvent.setup();
    const onSelectCategory = vi.fn();
    const screen = render(
      <CategorySelect
        selectedCategory={null}
        onSelectCategory={onSelectCategory}
      />
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /wählen/i })).toBeVisible()
    );
    screen.getByRole('button', { name: /wählen/i }).click();
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /material/i })).toBeVisible();
    });
    await user.click(await screen.findByRole('option', { name: /material/i }));
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
      const screen = render(
        <CategorySelect selectedCategory={null} onSelectCategory={() => {}} />
      );
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /wählen/i })).toBeVisible();
      });
      screen.getByRole('button', { name: /wählen/i }).click();
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
