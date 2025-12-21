import * as React from 'react';
import { render, waitFor, userEvent } from 'test/util';
import {
  SomeUser,
  SomeUserin,
  KeinErSieEsUser,
  adminGroup,
  tenant,
} from 'test/fixtures';
import { UserList } from './UserList';

import GetUserQuery from 'api/query/GetUserQuery.graphql';
import SearchUsersQuery from 'api/query/SearchUsersAsAdminQuery.graphql';

const adminUser = { ...SomeUser, groups: [adminGroup] };

const additionalMocks = [
  ...[KeinErSieEsUser, SomeUserin].map((user) => ({
    request: { query: GetUserQuery, variables: { id: user.id } },
    result: { data: { user } },
  })),
  ...['Michel']
    .map((fullTerm) => {
      return new Array(fullTerm.length)
        .fill(null)
        .map((_, i) => fullTerm.slice(0, i + 1));
    })
    .flat()
    .map((searchtext) => ({
      request: {
        query: SearchUsersQuery,
        variables: { searchtext, groups: null, lastSeen: null },
      },
      result: {
        data: {
          users: [KeinErSieEsUser],
        },
      },
    })),
  {
    request: {
      query: SearchUsersQuery,
      variables: { searchtext: null, groups: [{ id: '1' }], lastSeen: null },
    },
    result: {
      data: {
        users: [],
      },
    },
  },
  {
    request: {
      query: SearchUsersQuery,
      variables: { searchtext: null, groups: [{ id: '1' }], lastSeen: 30 },
    },
    result: {
      data: {
        users: [],
      },
    },
  },
];

const tenantWithStats = {
  ...tenant,
  stats: {
    userCount: 2,
    articleCount: 5,
  },
};

describe('pages/admin/users/list', () => {
  const mocks = [
    ...additionalMocks,
    {
      request: {
        query: SearchUsersQuery,
        variables: { searchtext: 'Michel' },
      },
      result: () => {
        return { data: { users: [KeinErSieEsUser] } };
      },
    },
  ];

  it('should show the total count of users when no search is entered', async () => {
    const screen = render(
      <UserList currentUser={adminUser} tenant={tenantWithStats} />,
      {},
      { additionalMocks: mocks }
    );

    await waitFor(() => {
      expect(screen.getByTestId('total-users-count')).toHaveTextContent(
        '2 Nutzer registriert'
      );
    });
  });

  it('should search users and show results, open popup when clicking on result', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <UserList currentUser={adminUser} tenant={tenant} />,
      {},
      {
        additionalMocks: mocks,
      }
    );

    await fireEvent.type(
      screen.getByRole('textbox', { name: /namen suchen/i }),
      'Michel'
    );

    expect(await screen.findByText(/1 Ergebnis/)).toBeVisible();
    const userRow = await screen.findByRole('row', { name: /michel dupond/i });
    expect(userRow).toBeVisible();
    await fireEvent.click(userRow);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });
  });

  it('should search with groups and lastSeen, showing a message when no results were found', async () => {
    const user = userEvent.setup();
    const screen = render(
      <UserList currentUser={adminUser} tenant={tenantWithStats} />,
      {},
      {
        additionalMocks: mocks,
      }
    );

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: /gruppe filtern/i })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: /gruppe filtern/i }));
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeVisible();
    });

    await user.click(screen.getByRole('option', { name: /administrator/i }));

    await user.click(
      await screen.findByRole('button', { name: /zuletzt angemeldet/i })
    );

    await waitFor(() => {
      expect(
        screen.getByRole('listbox', { name: /angemeldet/i })
      ).toBeVisible();
    });

    await user.click(screen.getAllByRole('option')[0]);
    await waitFor(() => {
      expect(screen.getByText('Keine Nutzer gefunden.')).toBeVisible();
    });
  });
});
