import * as React from 'react';
import { render, screen, waitFor, userEvent } from 'test/util';
import { ComputerExperten, FaecherCategory } from 'test/fixtures';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';

import DeleteCategoryMutation from 'api/mutation/DeleteCategoryMutation.graphql';
import GetArticlesQuery from 'api/query/GetArticlesQuery.graphql';

const mocks = [
  {
    request: {
      query: DeleteCategoryMutation,
      variables: {
        id: FaecherCategory.id,
      },
    },
    result: { data: { category: { id: FaecherCategory.id } } },
  },
  {
    request: {
      query: GetArticlesQuery,
      variables: { categoryId: FaecherCategory.id },
    },
    result: { data: { articles: [ComputerExperten] } },
  },
];

describe('shared/layouts/adminLayout/userManagment/DeleteCategoryDialog', () => {
  it('should show the number of articles which categories will be removed.', async () => {
    render(
      <DeleteCategoryDialog
        isOpen
        categoryToDelete={FaecherCategory}
        onConfirm={() => {}}
        onRequestClose={() => {}}
      />,
      {},
      { additionalMocks: mocks }
    );
    await waitFor(() => {
      expect(screen.getByText(/beiträge: 1/i)).toBeVisible();
    });
  });

  it('should show the number of categories which be set top-level', async () => {
    render(
      <DeleteCategoryDialog
        isOpen
        categoryToDelete={FaecherCategory}
        onConfirm={() => {}}
        onRequestClose={() => {}}
      />,
      {},
      { additionalMocks: mocks }
    );
    await waitFor(() => {
      expect(screen.getByText(/unterkategorien: 6/i)).toBeVisible();
    });
  });

  it('should call onRequestClose when clicking the "Abort" button', async () => {
    const fireEvent = userEvent.setup();
    const onRequestClose = vi.fn();
    render(
      <DeleteCategoryDialog
        isOpen
        categoryToDelete={FaecherCategory}
        onConfirm={() => {}}
        onRequestClose={onRequestClose}
      />,
      {},
      { additionalMocks: mocks }
    );
    await fireEvent.click(screen.getByRole('button', { name: /abbrechen/i }));

    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });
  });

  describe('send delete request', () => {
    it('delete the category and close the dialog', async () => {
      const fireEvent = userEvent.setup();
      const onConfirm = vi.fn();
      const screen = render(
        <DeleteCategoryDialog
          isOpen
          categoryToDelete={FaecherCategory}
          onConfirm={onConfirm}
          onRequestClose={() => {}}
        />,
        {},
        { additionalMocks: mocks }
      );
      await fireEvent.click(
        screen.getByRole('button', { name: /endgültig löschen/ })
      );

      await waitFor(
        () => {
          expect(onConfirm).toHaveBeenCalled();
        },
        { timeout: 2500 }
      );
    });
  });
});
