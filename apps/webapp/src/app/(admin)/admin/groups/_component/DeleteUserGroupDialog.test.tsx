import * as React from 'react';
import { MockLink } from '@apollo/client/testing';
import { render, screen, waitFor, userEvent } from 'test/util';
import {
  Weihnachtsmarkt,
  ComputerExperten,
  VivaLaRevolucion,
  lehrerGroup,
} from 'test/fixtures';
import {
  DeleteUserGroupDialog,
  DELETE_USER_GROUP,
} from './DeleteUserGroupDialog';

describe('administration: DeleteUserGroupDialog', () => {
  it('should be hidden and open when "isOpen" is passed and close when cancelled', async () => {
    const fireEvent = userEvent.setup();

    const onRequestClose = vi.fn();

    const screen = render(
      <DeleteUserGroupDialog
        group={null}
        onConfirm={() => {}}
        onRequestClose={onRequestClose}
      />
    );

    expect(screen.queryByRole('dialog')).toBeNull();

    screen.rerender(
      <DeleteUserGroupDialog
        group={lehrerGroup}
        onConfirm={() => {}}
        onRequestClose={onRequestClose}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /gruppe löschen/i })
      ).toBeVisible();
    });

    await fireEvent.click(screen.getByRole('button', { name: /abbrechen/i }));

    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });

    screen.rerender(
      <DeleteUserGroupDialog
        group={null}
        onConfirm={() => {}}
        onRequestClose={onRequestClose}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('should call onRequestClose when clicking the "Abort" button', async () => {
    const fireEvent = userEvent.setup();
    const onRequestClose = vi.fn();
    render(
      <DeleteUserGroupDialog
        group={lehrerGroup}
        onConfirm={() => {}}
        onRequestClose={onRequestClose}
      />
    );
    await fireEvent.click(screen.getByRole('button', { name: /abbrechen/i }));

    await waitFor(() => {
      expect(onRequestClose).toHaveBeenCalled();
    });
  });

  describe('send delete request', () => {
    it('delete the group and show a list of unpublished articles', async () => {
      const mocks: MockLink.MockedResponse[] = [
        {
          request: {
            query: DELETE_USER_GROUP,
            variables: {
              id: lehrerGroup.id,
            },
          },
          result: vi.fn(() => ({
            data: {
              deleteUserGroup: {
                userGroup: lehrerGroup,
                unpublishedArticles: [
                  Weihnachtsmarkt,
                  ComputerExperten,
                  VivaLaRevolucion,
                ],
              },
            },
          })),
        },
      ];

      const fireEvent = userEvent.setup();
      const onConfirm = vi.fn();
      const screen = render(
        <DeleteUserGroupDialog
          group={lehrerGroup}
          onConfirm={onConfirm}
          onRequestClose={() => {}}
        />,
        {},
        { additionalMocks: mocks }
      );
      await fireEvent.click(
        screen.getByRole('button', { name: /endgültig löschen/ })
      );

      await waitFor(() => {
        expect(mocks[0].result).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeVisible();
      });

      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByText(Weihnachtsmarkt.title)).toBeVisible();
      expect(screen.getByText(ComputerExperten.title)).toBeVisible();
      expect(screen.getByText(VivaLaRevolucion.title)).toBeVisible();

      await fireEvent.click(
        screen.getAllByRole('button', { name: /schließen/i })[1]
      );

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });

    it('should send onConfirm even when closing via dialogs "close" button', async () => {
      const mocks: MockLink.MockedResponse[] = [
        {
          request: {
            query: DELETE_USER_GROUP,
            variables: {
              id: lehrerGroup.id,
            },
          },
          result: {
            data: {
              deleteUserGroup: {
                userGroup: lehrerGroup,
                unpublishedArticles: [],
              },
            },
          },
        },
      ];

      const fireEvent = userEvent.setup();
      const onConfirm = vi.fn();
      const onRequestClose = vi.fn();
      const screen = render(
        <DeleteUserGroupDialog
          group={lehrerGroup}
          onConfirm={onConfirm}
          onRequestClose={onRequestClose}
        />,
        {},
        { additionalMocks: mocks }
      );
      await fireEvent.click(
        screen.getByRole('button', { name: /endgültig löschen/ })
      );

      await waitFor(() => {
        expect(
          screen.getAllByRole('button', { name: /schließen/i })
        ).toHaveLength(2);
      });
      await fireEvent.click(
        screen.getAllByRole('button', { name: /schließen/i })[0]
      );

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });
  });
});
