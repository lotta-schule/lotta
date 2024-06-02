import { SplitViewProvider } from '@lotta-schule/hubert';
import { lehrerGroup, userGroups } from 'test/fixtures';
import { render, waitFor, within } from 'test/util';
import { GroupList } from './GroupList';
import userEvent from '@testing-library/user-event';

import GetGroupQuery from 'api/query/GetGroupQuery.graphql';
import DeleteUserGroupMutation from 'api/mutation/DeleteUserGroupMutation.graphql';

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
    const screen = renderWithContext(<GroupList groups={extendedUserGroups} />);
    expect(screen.getAllByRole('listitem').length).toEqual(29);
  });

  it('should highlight a group by name', async () => {
    let scrolledElement: HTMLElement | null = null;
    const scrollIntoViewMock = vi.fn(function (this: HTMLElement) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      scrolledElement = this;
    });
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    const fireEvent = userEvent.setup();
    const screen = renderWithContext(
      <GroupList groups={extendedUserGroups} />,
      {},
      { additionalMocks }
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
    const screen = renderWithContext(<GroupList groups={extendedUserGroups} />);
    expect(
      screen.getAllByRole('listitem', { name: 'New group 1' }).length
    ).toEqual(1);
  });

  it('should open the EditGroup when clicking on the group name', async () => {
    const fireEvent = userEvent.setup();
    const screen = renderWithContext(
      <GroupList groups={extendedUserGroups} />,
      {},
      {
        userGroups: extendedUserGroups,
        additionalMocks,
      }
    );
    const groupLI = screen.getByRole('listitem', { name: 'Administrator' });
    await fireEvent.click(groupLI);
    await waitFor(() => {
      expect(
        screen.getByRole('form', {
          name: 'Gruppe "Administrator" bearbeiten',
        })
      ).toBeVisible();
    });
  });

  it('should change sorting via the select', async () => {
    const fireEvent = userEvent.setup();
    const screen = renderWithContext(<GroupList groups={extendedUserGroups} />);
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
        /new group 0/i
      );
    });

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

  describe('delete group', () => {
    it('should show a delete dialog', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <GroupList groups={extendedUserGroups} />,
        {},
        {
          additionalMocks: [
            ...additionalMocks,
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
                    userGroup: {
                      id: lehrerGroup.id,
                    },
                    unpublishedArticles: [],
                  },
                },
              },
            },
          ],
        }
      );

      await fireEvent.click(screen.getByRole('listitem', { name: /lehrer/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('form', { name: /"Lehrer" bearbeiten/i })
        ).toBeVisible();
      });
      await fireEvent.click(
        await screen.findByRole('button', { name: /gruppe .* löschen/i })
      );
      const dialog = await screen.findByRole('dialog', {
        name: /löschen/i,
      });
      await waitFor(() => {
        expect(dialog).toBeVisible();
      });

      await fireEvent.click(
        await within(dialog).findByRole('button', {
          name: /löschen/i,
        })
      );

      await waitFor(() => {
        expect(
          within(dialog).getAllByRole('button', {
            name: /schließen/i,
          })[1]
        ).toBeVisible();
      });
      await fireEvent.click(
        within(dialog).getAllByRole('button', {
          name: /schließen/i,
        })[1]
      );

      await waitFor(() => {
        expect(dialog).not.toBeVisible();
      });
    });

    it('should hide a delete dialog when dialog is "canceled"', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <GroupList groups={userGroups} />,
        {},
        { additionalMocks }
      );

      await fireEvent.click(screen.getByRole('listitem', { name: /lehrer/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('form', { name: /"Lehrer" bearbeiten/i })
        ).toBeVisible();
      });
      await fireEvent.click(
        await screen.findByRole('button', { name: /gruppe .* löschen/i })
      );
      const dialog = await screen.findByRole('dialog', {
        name: /löschen/i,
      });
      await waitFor(() => {
        expect(dialog).toBeVisible();
      });

      await fireEvent.click(
        await within(dialog).findByRole('button', {
          name: /abbrechen/i,
        })
      );

      await waitFor(() => {
        expect(dialog).not.toBeVisible();
      });

      expect(
        screen.getByRole('form', { name: /"Lehrer" bearbeiten/i })
      ).toBeVisible();
    });
  });
});
