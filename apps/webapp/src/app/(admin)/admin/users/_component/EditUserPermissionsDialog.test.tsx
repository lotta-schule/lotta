import * as React from 'react';
import { MockLink } from '@apollo/client/testing';
import { render, waitFor, userEvent } from 'test/util';
import { SomeUser, adminGroup, lehrerGroup, elternGroup } from 'test/fixtures';
import { EditUserPermissionsDialog } from './EditUserPermissionsDialog';

import UpdateUserMutation from 'api/mutation/UpdateUserMutation.graphql';
import GetUserQuery from 'api/query/GetUserQuery.graphql';

/* See https://github.com/lotta-schule/lotta/issues/528 */
/* This component must vanish */
describe.skip('shared/layouts/adminLayout/userManagment/EditUserPermissionsDialog', () => {
  const mocks = (user: any) =>
    [
      {
        request: { query: GetUserQuery, variables: { id: user.id } },
        result: vi.fn(() => ({ data: { user } })),
      },
    ] as MockLink.MockedResponse[];

  describe('show userAvatar basic information', () => {
    it('should show userAvatar information', async () => {
      const targetUser = { ...SomeUser, groups: [], assignedGroups: [] };
      const additionalMocks = mocks(targetUser);
      const screen = render(
        <EditUserPermissionsDialog
          selectedUser={targetUser}
          onRequestClose={() => {}}
        />,
        {},
        { additionalMocks }
      );
      await waitFor(() => {
        expect(additionalMocks[0].result).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: /Ernesto Guevara/ })
        ).toBeVisible();
      });
      expect(screen.queryByTestId('UserNickname')).toHaveTextContent('Che');
      expect(screen.queryByTestId('UserEmail')).toHaveTextContent(
        'userAvatar@lotta.schule'
      );
    });
  });

  describe('show and select correct groups', () => {
    it('should show assigned and dynamic groups', async () => {
      const targetUser = {
        ...SomeUser,
        groups: [adminGroup, lehrerGroup],
        assignedGroups: [adminGroup],
      };
      const additionalMocks = mocks(targetUser);
      const screen = render(
        <EditUserPermissionsDialog
          selectedUser={targetUser}
          onRequestClose={() => {}}
        />,
        {},
        { additionalMocks }
      );
      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: /Ernesto Guevara/ })
        ).toBeVisible();
      });

      const assignedGroups = await screen.findByTestId('GroupSelectSelection');
      expect(assignedGroups).toHaveTextContent(/Administrator/);

      expect(screen.queryByTestId('DynamicGroups')).toHaveTextContent(
        `Über Einschreibeschlüssel zugewiesene Gruppen:Lehrer`
      );
    });
    describe('saving', () => {
      it('should assign new group after save button is clicked click', async () => {
        const user = userEvent.setup();
        const targetUser = {
          ...SomeUser,
          groups: [adminGroup, lehrerGroup],
          assignedGroups: [adminGroup],
        };
        const additionalMocks = [
          ...mocks(targetUser),
          {
            request: {
              query: UpdateUserMutation,
              variables: {
                id: targetUser.id,
                groups: [adminGroup.id, elternGroup.id].map((id) => ({ id })),
              },
            },
            result: vi.fn(() => ({
              data: {
                user: {
                  ...targetUser,
                  assignedGroups: [...targetUser.assignedGroups, elternGroup],
                },
              },
            })),
          },
        ];
        const screen = render(
          <EditUserPermissionsDialog
            selectedUser={targetUser}
            onRequestClose={() => {}}
          />,
          {},
          { additionalMocks }
        );
        await waitFor(() => {
          expect(additionalMocks[0].result).toHaveBeenCalled();
        });

        const assignedGroups = await screen.findByTestId(
          'GroupSelectSelection'
        );
        expect(assignedGroups).toHaveTextContent(/Administrator/i);

        (
          await screen.findByRole('button', { name: /empfehlungen/i })
        ).dispatchEvent(new PointerEvent('pointerdown'));

        await waitFor(() => {
          expect(screen.getByRole('listbox')).toBeVisible();
        });

        await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

        await user.click(await screen.findByRole('option', { name: 'Eltern' }));

        await user.click(screen.getByRole('button', { name: /speichern/i }));

        await waitFor(() => {
          expect(additionalMocks[1].result).toHaveBeenCalled();
        });
      });

      it('should unassign new group on click', async () => {
        const user = userEvent.setup();
        const targetUser = {
          ...SomeUser,
          groups: [adminGroup, lehrerGroup, elternGroup],
          assignedGroups: [adminGroup, elternGroup],
        };
        const additionalMocks = [
          ...mocks(targetUser),
          {
            request: {
              query: UpdateUserMutation,
              variables: {
                id: SomeUser.id,
                groups: [{ id: adminGroup.id }],
              },
            },
            result: vi.fn(() => ({
              data: {
                user: { ...targetUser, assignedGroups: [adminGroup] },
              },
            })),
          },
        ];
        const screen = render(
          <EditUserPermissionsDialog
            selectedUser={targetUser}
            onRequestClose={() => {}}
          />,
          {},
          { additionalMocks }
        );
        await waitFor(() => {
          expect(additionalMocks[0].result).toHaveBeenCalled();
        });
        const assignedGroups = await screen.findByTestId(
          'GroupSelectSelection'
        );
        await waitFor(() => {
          expect(assignedGroups).toHaveTextContent('Administrator');
        });

        await user.click(
          await screen.findByRole('button', { name: /empfehlungen/i })
        );
        await waitFor(() => {
          expect(screen.queryByRole('listbox')).toBeVisible();
        });

        await user.click(await screen.findByRole('option', { name: 'Eltern' }));

        await user.click(screen.getByRole('button', { name: /speichern/i }));

        await waitFor(() => {
          expect(additionalMocks[1].result).toHaveBeenCalled();
        });
      });
    });
  });

  it('should open delete user dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    const targetUser = { ...SomeUser, groups: [], assignedGroups: [] };

    const additionalMocks = mocks(targetUser);
    const screen = render(
      <EditUserPermissionsDialog
        selectedUser={targetUser}
        onRequestClose={() => {}}
      />,
      {},
      { additionalMocks }
    );

    await waitFor(() => {
      expect(additionalMocks[0].result).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('button', { name: /benutzer löschen/i }));
    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /ernesto guevara löschen/i })
      ).toBeVisible();
    });
  });
});
