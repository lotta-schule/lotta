import * as React from 'react';
import { render, waitFor } from 'test/util';
import {
  SomeUser,
  SomeUserin,
  KeinErSieEsUser,
  adminGroup,
  tenant,
} from 'test/fixtures';
import { UserList } from 'administration/users/UserList';
import userEvent from '@testing-library/user-event';

import GetUserQuery from 'api/query/GetUserQuery.graphql';
import SearchUsersQuery from 'api/query/SearchUsersAsAdminQuery.graphql';
import GetTenantWithStatsQuery from 'api/query/GetTenantWithStatsQuery.graphql';

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
  {
    request: {
      query: GetTenantWithStatsQuery,
    },
    result: {
      data: {
        tenant: {
          ...tenant,
          stats: {
            userCount: 2,
            articleCount: 5,
          },
        },
      },
    },
  },
];

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
      <UserList />,
      {},
      { currentUser: adminUser, additionalMocks: mocks }
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
      <UserList />,
      {},
      {
        currentUser: adminUser,
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
    const fireEvent = userEvent.setup();
    const screen = render(
      <UserList />,
      {},
      {
        currentUser: adminUser,
        additionalMocks: mocks,
      }
    );

    await fireEvent.click(
      screen.getByRole('button', { name: /gruppe filtern/i })
    );
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeVisible();
    });
    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for animation to finish
    await fireEvent.click(screen.getAllByRole('option')[0]);

    await fireEvent.click(
      screen.getByRole('button', { name: /zuletzt angemeldet/i })
    );

    await waitFor(() => {
      expect(
        screen.getByRole('listbox', { name: /angemeldet/i })
      ).toBeVisible();
    });
    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for animation to finish

    await fireEvent.click(screen.getAllByRole('option')[0]);
    await waitFor(() => {
      expect(screen.getByText('Keine Nutzer gefunden.')).toBeVisible();
    });
  });
});
