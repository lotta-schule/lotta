import * as React from 'react';
import { omit } from 'lodash';
import { User } from 'util/model';
import { render, waitFor, userEvent } from 'test/util';
import { KeinErSieEsUser, SomeUser } from 'test/fixtures';
import { SearchUserField } from './SearchUserField';

import SearchUsersQuery from 'api/query/SearchUsersQuery.graphql';

describe('shared/layouts/userManagment/SearchUserField', () => {
  it('should disable the text input when prop "disabled" is passed', () => {
    const screen = render(
      <SearchUserField disabled onSelectUser={() => {}} />,
      {},
      {}
    );
    expect(
      screen.getByRole('combobox', { name: /nutzer suchen/i })
    ).toBeDisabled();
  });

  describe('searching users', () => {
    const additionalMocks = [
      ...['Michel']
        .map((fullTerm) => {
          return new Array(fullTerm.length)
            .fill(null)
            .map((_, i) => fullTerm.slice(0, i + 1));
        })
        .flat()
        .concat([User.getName(KeinErSieEsUser)])
        .map((searchtext) => ({
          request: { query: SearchUsersQuery, variables: { searchtext } },
          result: {
            data: {
              users: [KeinErSieEsUser],
            },
          },
        })),
    ];

    it('should show the correct search results for a search term', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <SearchUserField onSelectUser={() => {}} />,
        {},
        {
          currentUser: SomeUser,
          additionalMocks,
        }
      );
      await fireEvent.type(
        screen.getByRole('combobox', { name: /nutzer suchen/i }),
        'Michel'
      );
      await waitFor(() => {
        expect(screen.queryAllByRole('option')).toHaveLength(1);
      });
    });

    it('should call "onSelectUser" with the correct userAvatar when selected', async () => {
      const fireEvent = userEvent.setup();
      const selectUserFn = vi.fn();
      const screen = render(
        <SearchUserField onSelectUser={selectUserFn} />,
        {},
        { currentUser: SomeUser, additionalMocks }
      );
      await fireEvent.type(
        screen.getByRole('combobox', { name: /nutzer suchen/i }),
        'Michel'
      );
      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: /michel dupond/i })
        ).toHaveTextContent('Michel Dupond');
      });
      await new Promise((resolve) => setTimeout(resolve, 500)); // wait for animation to finish

      await fireEvent.click(
        screen.getByRole('option', { name: /michel dupond/i })
      );

      expect(selectUserFn).toHaveBeenCalledWith(
        omit(KeinErSieEsUser, [
          'email',
          'eduplacesId',
          'enrollmentTokens',
          'groups',
          'assignedGroups',
          'hideFullName',
          'lastSeen',
          'unreadMessages',
          'hasChangedDefaultPassword',
        ])
      );
    });
  });
});
