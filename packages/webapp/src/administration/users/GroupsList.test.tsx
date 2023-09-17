import { adminGroup, userGroups } from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { GroupList } from './GroupList';
import userEvent from '@testing-library/user-event';

import GetGroupQuery from '../../api/query/GetGroupQuery.graphql';

const extendedUserGroups = [
  ...userGroups,
  ...new Array(25).fill(null).map((_, i) => ({
    id: `new-group-${i}`,
    name: `New group ${i}`,
    sortKey: 100 + i * 10,
    isAdminGroup: false,
    insertedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enrollmentTokens: [],
  })),
];

describe('administration/users/GroupList', () => {
  it('should list all groups', () => {
    const screen = render(
      <GroupList />,
      {},
      {
        userGroups: extendedUserGroups,
      }
    );
    expect(screen.getAllByRole('listitem').length).toEqual(29);
  });

  it('should split up groups into 4 columns', () => {
    const screen = render(
      <GroupList />,
      {},
      {
        userGroups: extendedUserGroups,
      }
    );
    expect(screen.getAllByRole('list').length).toEqual(4);
  });

  it('should show the group name', () => {
    const screen = render(
      <GroupList />,
      {},
      {
        userGroups: extendedUserGroups,
      }
    );
    expect(
      screen.getAllByRole('listitem', { name: 'New group 1' }).length
    ).toEqual(1);
  });

  it('should open the EditGroupDialog when clicking on the group name', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <GroupList />,
      {},
      {
        userGroups: extendedUserGroups,
        additionalMocks: [
          {
            request: {
              query: GetGroupQuery,
              variables: { id: adminGroup.id },
            },
            result: { data: { group: adminGroup } },
          },
        ],
      }
    );
    const groupLI = screen.getByRole('listitem', { name: 'Administrator' });
    await fireEvent.click(groupLI);
    waitFor(() => {
      expect(
        screen.getByRole('dialog', {
          name: 'Gruppe "Administrator" bearbeiten',
        })
      ).toBeVisible();
    });
  });
});
