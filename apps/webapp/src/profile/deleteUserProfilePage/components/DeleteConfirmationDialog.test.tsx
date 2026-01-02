import * as React from 'react';
import { SomeUser } from 'test/fixtures';
import { render, userEvent, waitFor } from 'test/util';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { PERMANENTLY_DELETE_USER_ACCOUNT } from '../queries';
import * as browserLocation from 'util/browserLocation';

describe('profile/deleteUserProfilePage/components/DeleteConfirmationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when open is false', () => {
    const screen = render(
      <DeleteConfirmationDialog
        open={false}
        selectedFilesToTransfer={[]}
        onClose={vi.fn()}
      />,
      {},
      { currentUser: SomeUser }
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should render dialog when open is true', async () => {
    const screen = render(
      <DeleteConfirmationDialog
        open
        selectedFilesToTransfer={[]}
        onClose={vi.fn()}
      />,
      {},
      { currentUser: SomeUser }
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });
    expect(screen.getByText(/Benutzerkonto wirklich löschen/i)).toBeVisible();
  });

  it('should call onClose when cancel button clicked', async () => {
    const fireEvent = userEvent.setup();
    const onClose = vi.fn();
    const screen = render(
      <DeleteConfirmationDialog
        open={true}
        selectedFilesToTransfer={[]}
        onClose={onClose}
      />,
      {},
      { currentUser: SomeUser }
    );

    await fireEvent.click(screen.getByRole('button', { name: /abbrechen/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should execute deletion mutation with no files', async () => {
    const fireEvent = userEvent.setup();
    const deleteMutationFn = vi.fn(() => ({ data: { user: SomeUser } }));

    const screen = render(
      <DeleteConfirmationDialog
        open={true}
        selectedFilesToTransfer={[]}
        onClose={vi.fn()}
      />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
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

    await fireEvent.click(
      screen.getByRole('button', {
        name: /Jetzt alle Daten endgültig löschen/i,
      })
    );

    await waitFor(() => {
      expect(deleteMutationFn).toHaveBeenCalled();
    });

    expect(browserLocation.redirectTo).toHaveBeenCalledWith('/auth/logout');
  });

  it('should execute deletion mutation with selected files', async () => {
    const fireEvent = userEvent.setup();
    const selectedFiles = [{ id: 'file1' }, { id: 'file2' }];
    const deleteMutationFn = vi.fn(() => ({ data: { user: SomeUser } }));

    const screen = render(
      <DeleteConfirmationDialog
        open={true}
        selectedFilesToTransfer={selectedFiles}
        onClose={vi.fn()}
      />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: {
              query: PERMANENTLY_DELETE_USER_ACCOUNT,
              variables: {
                userId: SomeUser.id,
                transferFileIds: ['file1', 'file2'],
              },
            },
            result: deleteMutationFn,
          },
        ],
      }
    );

    await fireEvent.click(
      screen.getByRole('button', {
        name: /Jetzt alle Daten endgültig löschen/i,
      })
    );

    await waitFor(() => {
      expect(deleteMutationFn).toHaveBeenCalled();
    });
  });

  it('should show error message if mutation fails', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const screen = render(
      <DeleteConfirmationDialog
        open={true}
        selectedFilesToTransfer={[]}
        onClose={vi.fn()}
      />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: {
              query: PERMANENTLY_DELETE_USER_ACCOUNT,
              variables: {
                userId: SomeUser.id,
                transferFileIds: [],
              },
            },
            error: new Error('Network error'),
          },
        ],
      }
    );

    await user.click(
      screen.getByRole('button', {
        name: /daten endgültig löschen/i,
      })
    );

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeVisible();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should disable delete button while loading', async () => {
    const fireEvent = userEvent.setup();

    const screen = render(
      <DeleteConfirmationDialog
        open={true}
        selectedFilesToTransfer={[]}
        onClose={vi.fn()}
      />,
      {},
      {
        currentUser: SomeUser,
        additionalMocks: [
          {
            request: {
              query: PERMANENTLY_DELETE_USER_ACCOUNT,
              variables: {
                userId: SomeUser.id,
                transferFileIds: [],
              },
            },
            delay: 100,
            result: { data: { user: SomeUser } },
          },
        ],
      }
    );

    const deleteButton = screen.getByRole('button', {
      name: /Jetzt alle Daten endgültig löschen/i,
    });
    await fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteButton).toBeDisabled();
    });
  });
});
