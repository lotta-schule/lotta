import * as React from 'react';
import { render, screen, waitFor } from 'test/util';
import {
  Weihnachtsmarkt,
  ComputerExperten,
  VivaLaRevolucion,
  lehrerGroup,
} from 'test/fixtures';
import { DeleteUserGroupDialog } from './DeleteUserGroupDialog';
import userEvent from '@testing-library/user-event';

import DeleteUserGroupMutation from 'api/mutation/DeleteUserGroupMutation.graphql';

describe('administration: DeleteUserGroupDialog', () => {
  it('should be hidden and open when "isOpen" is passed and close when cancelled', async () => {
    const fireEvent = userEvent.setup();

    const onRequestClose = jest.fn();

    const screen = render(
      <DeleteUserGroupDialog
        isOpen={false}
        group={lehrerGroup}
        onConfirm={() => {}}
        onRequestClose={onRequestClose}
      />
    );

    expect(screen.queryByRole('dialog')).toBeNull();

    screen.rerender(
      <DeleteUserGroupDialog
        isOpen={true}
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
        isOpen={false}
        group={lehrerGroup}
        onConfirm={() => {}}
        onRequestClose={onRequestClose}
      />
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should call onRequestClose when clicking the "Abort" button', async () => {
    const fireEvent = userEvent.setup();
    const onRequestClose = jest.fn();
    render(
      <DeleteUserGroupDialog
        isOpen
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
      const mocks = [
        {
          request: {
            query: DeleteUserGroupMutation,
            variables: {
              id: lehrerGroup.id,
            },
          },
          result: {
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
          },
        },
      ];

      const fireEvent = userEvent.setup();
      const onConfirm = jest.fn();
      const screen = render(
        <DeleteUserGroupDialog
          isOpen
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

      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
