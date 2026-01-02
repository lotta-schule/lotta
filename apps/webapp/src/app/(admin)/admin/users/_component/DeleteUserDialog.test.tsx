import * as React from 'react';
import { ComputerExperten, SomeUser } from 'test/fixtures';
import { render, waitFor, userEvent } from 'test/util';
import { DeleteUserDialog } from './DeleteUserDialog';
import { PERMANENTLY_DELETE_USER_ACCOUNT } from '../queries';

import GetArticlesWithUserFiles from 'api/query/GetArticlesWithUserFiles.graphql';

describe('administration/users/DeleteUserDialog', () => {
  it('should show a warning on the first page', async () => {
    const screen = render(<DeleteUserDialog user={SomeUser} />);
    await waitFor(() => {
      expect(screen.getByText(/nicht rückgängig gemacht werden/)).toBeVisible();
      expect(screen.getByRole('button', { name: /weiter/i })).toBeVisible();
      expect(screen.queryByRole('button', { name: /zurück/i })).toBeNull();
    });
  });

  it('close request closing the dialog on first page', async () => {
    const fireEvent = userEvent.setup();
    const onRequestClose = vi.fn();
    const screen = render(
      <DeleteUserDialog onRequestClose={onRequestClose} user={SomeUser} />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /abbrechen/i })).toBeVisible();
    });
    await fireEvent.click(screen.getByRole('button', { name: /abbrechen/i }));
    expect(onRequestClose).toHaveBeenCalled();
  });

  it("should show the user's used files in the second step if he has any in use", async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <DeleteUserDialog user={SomeUser} />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: {
              query: GetArticlesWithUserFiles,
              variables: { userId: SomeUser.id },
            },
            result: { data: { articles: [ComputerExperten] } },
          },
        ],
      }
    );

    await fireEvent.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(screen.getByText(/folgende beiträge/i)).toBeVisible();
    });
    expect(
      screen.getByRole('link', { name: 'Computerexperten' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /weiter/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /zurück/i })).toBeVisible();
  });

  it('should inform that the user has no files used in public articles if that is the case', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <DeleteUserDialog user={SomeUser} />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: {
              query: GetArticlesWithUserFiles,
              variables: { userId: SomeUser.id },
            },
            result: { data: { articles: [] } },
          },
        ],
      }
    );

    await fireEvent.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(screen.getByText(/keine dateien/i)).toBeVisible();
    });
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByRole('button', { name: /weiter/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /zurück/i })).toBeVisible();
  });

  it('should show a last warning and a delete button on the last step', async () => {
    const fireEvent = userEvent.setup();
    const onConfirm = vi.fn();
    const deleteMutationFn = vi.fn(() => ({ data: { user: SomeUser } }));
    const screen = render(
      <DeleteUserDialog onConfirm={onConfirm} user={SomeUser} />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: {
              query: GetArticlesWithUserFiles,
              variables: { userId: SomeUser.id },
            },
            result: { data: { articles: [] } },
          },
          {
            request: {
              query: PERMANENTLY_DELETE_USER_ACCOUNT,
              variables: {
                userId: SomeUser.id,
                transferFileIds: [],
              },
            },
            result: deleteMutationFn,
          },
        ],
      }
    );

    await fireEvent.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(screen.getByText(/keine dateien/i)).toBeVisible();
    });
    await fireEvent.click(screen.getByRole('button', { name: /weiter/i }));
    await waitFor(() => {
      expect(screen.getByText(/endgültig gelöscht/)).toBeVisible();
    });
    expect(screen.queryByRole('button', { name: /weiter/i })).toBeNull();
    expect(screen.getByRole('button', { name: /zurück/i })).toBeVisible();
    expect(
      screen.getByRole('button', { name: /endgültig löschen/i })
    ).toBeVisible();
    await fireEvent.click(
      screen.getByRole('button', { name: /endgültig löschen/i })
    );
    await waitFor(() => {
      expect(deleteMutationFn).toHaveBeenCalled();
    });
    expect(onConfirm).toHaveBeenCalled();
  });
});
