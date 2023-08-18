import * as React from 'react';
import { MockedResponse } from '@apollo/client/testing';
import { render, waitFor } from 'test/util';
import { SomeUser, adminGroup, lehrerGroup, elternGroup } from 'test/fixtures';
import { EditUserPermissionsDialog } from './EditUserPermissionsDialog';
import userEvent from '@testing-library/user-event';

import UpdateUserMutation from 'api/mutation/UpdateUserMutation.graphql';
import GetUserQuery from 'api/query/GetUserQuery.graphql';

describe('shared/layouts/adminLayout/userManagment/EditUserPermissionsDialog', () => {
  let userInfoLoaded = false;

  const mocks = (user: any) =>
    [
      {
        request: { query: GetUserQuery, variables: { id: user.id } },
        result: () => {
          userInfoLoaded = true;
          return { data: { user } };
        },
      },
    ] as MockedResponse[];

  beforeEach(() => {
    userInfoLoaded = false;
  });

  describe('show userAvatar basic information', () => {
    it('should show userAvatar information', async () => {
      const user = { ...SomeUser, groups: [], assignedGroups: [] };
      const screen = render(
        <EditUserPermissionsDialog user={user} onRequestClose={() => {}} />,
        {},
        { additionalMocks: mocks(user) }
      );
      await waitFor(() => {
        expect(userInfoLoaded).toEqual(true);
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
      const user = {
        ...SomeUser,
        groups: [adminGroup, lehrerGroup],
        assignedGroups: [adminGroup],
      };
      const screen = render(
        <EditUserPermissionsDialog user={user} onRequestClose={() => {}} />,
        {},
        { additionalMocks: mocks(user) }
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

    it('should assign new group on click', async () => {
      const fireEvent = userEvent.setup();
      let mutationHasBeenCalled = false;
      const user = {
        ...SomeUser,
        groups: [adminGroup, lehrerGroup],
        assignedGroups: [adminGroup],
      };
      const additionalMocks = [
        ...mocks(user),
        {
          request: {
            query: UpdateUserMutation,
            variables: {
              id: user.id,
              groups: [adminGroup.id, elternGroup.id].map((id) => ({ id })),
            },
          },
          result: () => {
            mutationHasBeenCalled = true;
            return {
              data: {
                user: {
                  ...user,
                  assignedGroups: [...user.assignedGroups, elternGroup],
                },
              },
            };
          },
        },
      ];
      const screen = render(
        <EditUserPermissionsDialog user={user} onRequestClose={() => {}} />,
        {},
        { additionalMocks }
      );
      await waitFor(() => {
        expect(userInfoLoaded).toEqual(true);
      });

      const assignedGroups = await screen.findByTestId('GroupSelectSelection');
      expect(assignedGroups).toHaveTextContent(/Administrator/i);

      await fireEvent.click(
        await screen.findByRole('button', { name: /vorschläge/i })
      );
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeVisible();
      });
      await fireEvent.click(
        await screen.findByRole('option', { name: 'Eltern' })
      );

      await waitFor(() => {
        expect(mutationHasBeenCalled).toEqual(true);
      });
    });

    it('should unassign new group on click', async () => {
      const fireEvent = userEvent.setup();
      let mutationHasBeenCalled = false;
      const user = {
        ...SomeUser,
        groups: [adminGroup, lehrerGroup, elternGroup],
        assignedGroups: [adminGroup, elternGroup],
      };
      const additionalMocks = [
        ...mocks(user),
        {
          request: {
            query: UpdateUserMutation,
            variables: {
              id: SomeUser.id,
              groups: [{ id: adminGroup.id }],
            },
          },
          result: () => {
            mutationHasBeenCalled = true;
            return {
              data: {
                user: { ...user, assignedGroups: [adminGroup] },
              },
            };
          },
        },
      ];
      const screen = render(
        <EditUserPermissionsDialog user={user} onRequestClose={() => {}} />,
        {},
        { additionalMocks }
      );
      await waitFor(() => {
        expect(userInfoLoaded).toEqual(true);
      });
      const assignedGroups = await screen.findByTestId('GroupSelectSelection');
      expect(assignedGroups).toHaveTextContent('Administrator');

      await fireEvent.click(
        await screen.findByRole('button', { name: /vorschläge/i })
      );
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeVisible();
      });
      await fireEvent.click(
        await screen.findByRole('option', { name: 'Eltern' })
      );

      await waitFor(() => {
        expect(mutationHasBeenCalled).toEqual(true);
      });
    });
  });

  it('should open delete user dialog when delete button is clicked', async () => {
    const fireEvent = userEvent.setup();
    const user = { ...SomeUser, groups: [], assignedGroups: [] };
    const screen = render(
      <EditUserPermissionsDialog user={user} onRequestClose={() => {}} />,
      {},
      { additionalMocks: mocks(user) }
    );
    await fireEvent.click(
      screen.getByRole('button', { name: /benutzer löschen/i })
    );
    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /ernesto guevara löschen/i })
      ).toBeVisible();
    });
  });
});
