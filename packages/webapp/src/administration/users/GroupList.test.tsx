import { SplitViewProvider } from '@lotta-schule/hubert';
import { userGroups } from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { GroupList } from './GroupList';
import userEvent from '@testing-library/user-event';

import GetGroupQuery from '../../api/query/GetGroupQuery.graphql';

const renderWithContext: typeof render = (children, ...other) => {
  return render(<SplitViewProvider>{children}</SplitViewProvider>, ...other);
};

const extendedUserGroups = [
  ...userGroups,
  ...new Array(25).fill(null).map((_, i) => ({
    id: `new-group-${i}`,
    name: `New group ${i}`,
    sortKey: 100 + i * 10,
    isAdminGroup: false,
    canReadFullName: false,
    insertedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enrollmentTokens: [],
  })),
];

const additionalMocks = extendedUserGroups.map((group) => ({
  request: { query: GetGroupQuery, variables: { id: group.id } },
  result: { data: { group } },
}));
describe('administration/users/GroupList', () => {
  it('should list all groups', () => {
    const screen = renderWithContext(
      <GroupList />,
      {},
      {
        userGroups: extendedUserGroups,
        additionalMocks,
      }
    );
    expect(screen.getAllByRole('listitem').length).toEqual(29);
  });

  it('should highlight a group by name', async () => {
    let scrolledElement: HTMLElement | null = null;
    const scrollIntoViewMock = jest.fn(function () {
      scrolledElement = this;
    });
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    const fireEvent = userEvent.setup();
    const screen = renderWithContext(
      <GroupList />,
      {},
      {
        userGroups: extendedUserGroups,
        additionalMocks,
      }
    );
    expect(screen.getByRole('textbox', { name: /suche/i })).toBeVisible();
    await fireEvent.type(
      screen.getByRole('textbox', { name: /suche/i }),
      'New Group 1'
    );
    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalled();
      expect(scrolledElement).toBe(
        screen.getByRole('listitem', { name: 'New group 1' })
      );
    });
  });

  it('should show the group name', () => {
    const screen = renderWithContext(
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

  it('should open the EditGroup when clicking on the group name', async () => {
    const fireEvent = userEvent.setup();
    const screen = renderWithContext(
      <GroupList />,
      {},
      {
        userGroups: extendedUserGroups,
        additionalMocks,
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

  it('should change sorting via the select', async () => {
    const fireEvent = userEvent.setup();
    const screen = renderWithContext(
      <GroupList />,
      {},
      {
        userGroups: extendedUserGroups,
        additionalMocks,
      }
    );
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
      /new group 0/i
    );

    await fireEvent.click(screen.getByRole('button', { name: /sortierung/i }));
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeVisible();
    });
    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for animation to finish

    await fireEvent.click(screen.getByRole('option', { name: /name/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
        'Administrator'
      );
    });
  });
});
