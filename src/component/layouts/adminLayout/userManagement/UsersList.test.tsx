import * as React from 'react';
import { render, waitFor } from 'test/util';
import { SomeUser, SomeUserin, KeinErSieEsUser, adminGroup, lehrerGroup } from 'test/fixtures';
import { UsersList } from './UsersList';
import { GetUsersQuery } from 'api/query/GetUsersQuery';
import { SearchUsersQuery } from 'api/query/SearchUsersQuery';
import userEvent from '@testing-library/user-event';

describe('component/layouts/adminLayout/userManagement/UsersList', () => {

    // For react-virtualized, must setup offsetHeight and offsetWidth
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 50 });
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 50 });
    });
    afterAll(() => {
        if (originalOffsetHeight) {
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
        }
        if (originalOffsetWidth) {
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
        }
    });

    let didCall = false,
        didSearch = false;
    const mocks = [
        {
            request: { query: GetUsersQuery  },
            result: () => {
                didCall = true;
                return { data: {
                    users: [{...SomeUser, groups: [adminGroup]}, {...SomeUserin, groups: [lehrerGroup]}, KeinErSieEsUser]
                } };
            }
        },
        {
            request: { query: SearchUsersQuery, variables: { searchtext: 'Michel' } },
            result: () => {
                didSearch = true;
                return { data: { users: [KeinErSieEsUser] } };
            }
        }
    ];
    beforeEach(() => {
        didCall = false;
        didSearch = false;
    });


    it('should render a UsersList without error', () => {
        render(
            <UsersList />,
            {},
            { currentUser: SomeUser, additionalMocks: mocks, useCache: true }
        );
    });

    describe('fetch and show user data', () => {
        it('Show all users when no settings are given', async () => {
            const screen = render(
                <UsersList />, {}, { currentUser: SomeUser, additionalMocks: mocks, useCache: true }
            );
            await waitFor(() => { expect(didCall).toEqual(true); });
            expect(await screen.findByRole('heading', { name: /registrierte nutzer/i })).toBeVisible();
            expect(screen.getByRole('cell', { name: /ernesto guevara/i }));
            expect(screen.getByRole('cell', { name: /luisa drinalda/i }));
            expect(screen.getByRole('cell', { name: /michel dupond/i }));
        });

        it('Can filter the users by name', async () => {
            const screen = render(
                <UsersList />, {}, { currentUser: SomeUser, additionalMocks: mocks, useCache: true }
            );
            await waitFor(() => { expect(didCall).toEqual(true); });
            userEvent.type(screen.getByRole('textbox', { name: /name filtern/i }), 'Ernesto');
            expect(screen.getAllByRole('row')).toHaveLength(2);
            expect(screen.getByRole('cell', { name: /ernesto guevara/i }));
        });

        it('Can filter the users by group', async () => {
            const screen = render(
                <UsersList />, {}, { currentUser: SomeUser, additionalMocks: mocks, useCache: true }
            );
            await waitFor(() => { expect(didCall).toEqual(true); });
            userEvent.click(screen.getByRole('textbox', { name: /gruppe suchen/i }));
            const op = screen.getByRole('option', { name: /lehrer/i });
            expect(op).toBeVisible();
            userEvent.click(op);

            expect(await screen.findAllByRole('row')).toHaveLength(2);
            expect(screen.getByRole('cell', { name: /luisa drinalda/i }));
        });
    });

    describe('select a user', () => {
        it('should open a popup when clicking a row', async () => {
            const screen = render(
                <UsersList />, {}, { currentUser: SomeUser, additionalMocks: mocks, useCache: true }
            );
            await waitFor(() => { expect(didCall).toEqual(true); });
            const userRow = screen.getAllByRole('row')[2];
            expect(userRow).toBeDefined();
            userEvent.click(userRow);
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeVisible();
            });
        });

        it('should open a popup when selecting a user from the search', async () => {
            const screen = render(
                <UsersList />,
                {}, { currentUser: SomeUser, additionalMocks: mocks, useCache: true }
            );
            expect(screen.getByRole('textbox', { name: /nutzer suchen/i })).toBeVisible();
            userEvent.type(screen.getByRole('textbox', { name: /nutzer suchen/i }), 'Michel');
            expect(screen.getByRole('textbox', { name: /nutzer suchen/i })).toHaveFocus();
            await waitFor(() => {
                expect(screen.queryAllByRole('option')).toHaveLength(1);
            });
            userEvent.click(screen.getByRole('option', { name: /michel/i }));
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeVisible();
            });
        });
    });
});
