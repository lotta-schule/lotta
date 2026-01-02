import * as React from 'react';
import { UserModel } from 'model';
import { render, waitFor, userEvent, within } from 'test/util';
import { SomeUser, SomeUserin, schuelerGroup } from 'test/fixtures';
import { CreateMessageDialog } from './CreateMessageDialog';

import SearchUsersQuery from 'api/query/SearchUsersQuery.graphql';

const searchUsersMock = (searchTerm: string, results: UserModel[]) =>
  new Array(searchTerm.length).fill('').map((_, i) => ({
    request: {
      query: SearchUsersQuery,
      variables: { searchtext: searchTerm.slice(0, i + 1) },
    },
    result: {
      data: { users: i >= 2 ? results : [] },
    },
  }));

describe('CreateMessageDialog', () => {
  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 75));
  });

  describe('select detination popup', () => {
    const SomeUserWithGroups = { ...SomeUser, groups: [schuelerGroup] };

    it('should not show the "groups" tab if user has no groups', async () => {
      const screen = render(
        <CreateMessageDialog isOpen onAbort={() => {}} onConfirm={() => {}} />,
        {},
        { currentUser: SomeUser }
      );

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: /empfänger/i })
        ).toBeVisible();
      });

      expect(screen.getByRole('tablist')).toBeVisible();
      expect(
        within(screen.getByRole('tablist')).getAllByRole('tab')
      ).toHaveLength(1);
      expect(screen.queryByRole('tab')).toHaveTextContent(/nutzer/i);
    });

    it('should select a userAvatar and create the corresponding thread object', async () => {
      const user = userEvent.setup();
      const searchTerm = 'Drinalda';
      const onConfirm = vi.fn((destination) => {
        expect(destination.user.name).toEqual('Luisa Drinalda');
        expect(destination.group).not.toBeDefined();
      });
      const screen = render(
        <CreateMessageDialog isOpen onAbort={() => {}} onConfirm={onConfirm} />,
        {},
        {
          currentUser: SomeUserin,
          additionalMocks: searchUsersMock(searchTerm, [
            SomeUserWithGroups,
            SomeUserin,
          ]),
        }
      );

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: /empfänger/i })
        ).toBeVisible();
      });
      expect(
        screen.getByRole('tab', { name: /nutzer/i, selected: true })
      ).toBeVisible();

      await user.type(
        screen.getByRole('combobox', { name: /nutzer suchen/i }),
        'Drinalda'
      );
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).toBeNull();
      });
      await waitFor(
        () => {
          expect(
            screen.getByRole('option', { name: /drinalda/i })
          ).toBeVisible();
        },
        { timeout: 5000 }
      );
      await user.click(screen.getByRole('option', { name: /drinalda/i }));

      await waitFor(() => {
        expect(screen.getByTestId('message-destination')).toHaveTextContent(
          'Drinalda'
        );
      });

      await user.click(
        screen.getByRole('button', { name: 'Nachricht verfassen' })
      );

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });

    // See https://github.com/lotta-schule/lotta/issues/528
    it.skip('should select a group and call the onConfirm with it', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn((destination) => {
        expect(destination.user).not.toBeDefined();
        expect(destination.group.name).toEqual('Schüler');
      });
      const screen = render(
        <CreateMessageDialog isOpen onAbort={() => {}} onConfirm={onConfirm} />,
        {},
        { currentUser: SomeUserWithGroups }
      );

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', { name: /empfänger/i })
        ).toBeVisible();
      });

      await user.click(screen.getByRole('tab', { name: /gruppe/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /gruppe wählen/i })
        ).toBeVisible();
      });
      await user.click(screen.getByRole('button', { name: /empfehlungen/i }));
      expect(screen.getAllByRole('option')).toHaveLength(1);

      await user.click(screen.getByRole('option', { name: 'Schüler' }));

      await waitFor(() => {
        expect(screen.getByTestId('message-destination')).toHaveTextContent(
          'Schüler'
        );
      });

      await user.click(
        screen.getByRole('button', { name: 'Nachricht verfassen' })
      );

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });
  });
});
