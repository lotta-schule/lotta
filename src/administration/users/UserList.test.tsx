import * as React from 'react';
import { render, waitFor } from 'test/util';
import {
    SomeUser,
    SomeUserin,
    KeinErSieEsUser,
    adminGroup,
    lehrerGroup,
} from 'test/fixtures';
import { UserList } from 'administration/users/UserList';
import userEvent from '@testing-library/user-event';

import GetUsersQuery from 'api/query/GetUsersQuery.graphql';
import SearchUsersQuery from 'api/query/SearchUsersQuery.graphql';

const adminUser = { ...SomeUser, groups: [adminGroup] };

describe('pages/admin/users/list', () => {
    let didCall = false;
    const mocks = [
        {
            request: { query: GetUsersQuery },
            result: () => {
                didCall = true;
                return {
                    data: {
                        users: [
                            { ...SomeUser, groups: [adminGroup] },
                            { ...SomeUserin, groups: [lehrerGroup] },
                            KeinErSieEsUser,
                        ],
                    },
                };
            },
        },
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
    beforeEach(() => {
        didCall = false;
    });

    it('should render a List without error', () => {
        render(
            <UserList />,
            {},
            { currentUser: adminUser, additionalMocks: mocks }
        );
    });

    describe('fetch and show userAvatar data', () => {
        it('Show all users when no settings are given', async () => {
            const screen = render(
                <UserList />,
                {},
                {
                    currentUser: adminUser,
                    additionalMocks: mocks,
                }
            );
            await waitFor(() => {
                expect(didCall).toEqual(true);
            });
            expect(
                await screen.findByRole('heading', {
                    name: /registrierte nutzer/i,
                })
            ).toBeVisible();
            expect(screen.getByRole('cell', { name: /ernesto guevara/i }));
            expect(screen.getByRole('cell', { name: /luisa drinalda/i }));
            expect(screen.getByRole('cell', { name: /michel dupond/i }));
        });

        it('Can filter the users by name', async () => {
            const screen = render(
                <UserList />,
                {},
                {
                    currentUser: adminUser,
                    additionalMocks: mocks,
                }
            );
            await waitFor(() => {
                expect(didCall).toEqual(true);
            });
            userEvent.type(
                screen.getByRole('textbox', { name: /name filtern/i }),
                'Ernesto'
            );
            expect(screen.getAllByRole('row')).toHaveLength(2);
            expect(screen.getByRole('cell', { name: /ernesto guevara/i }));
        });

        it('Can filter the users by group', async () => {
            const screen = render(
                <UserList />,
                {},
                {
                    currentUser: adminUser,
                    additionalMocks: mocks,
                }
            );
            await waitFor(() => {
                expect(didCall).toEqual(true);
            });
            userEvent.click(
                screen.getByRole('button', { name: /vorschläge/i })
            );
            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /lehrer/i })
                ).toBeVisible();
            });
            userEvent.click(screen.getByRole('option', { name: /lehrer/i }));

            expect(await screen.findAllByRole('row')).toHaveLength(2);
            expect(screen.getByRole('cell', { name: /luisa drinalda/i }));
        });
    });

    describe('select a userAvatar', () => {
        it('should open a popup when clicking a row', async () => {
            const screen = render(
                <UserList />,
                {},
                {
                    currentUser: adminUser,
                    additionalMocks: mocks,
                }
            );
            await waitFor(() => {
                expect(didCall).toEqual(true);
            });
            const userRow = screen.getAllByRole('row')[2];
            expect(userRow).toBeDefined();
            userEvent.click(userRow);
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeVisible();
            });
        });

        it('should open a popup when selecting a userAvatar from the search', async () => {
            const screen = render(
                <UserList />,
                {},
                {
                    currentUser: adminUser,
                    additionalMocks: mocks,
                }
            );
            expect(
                screen.getByRole('combobox', { name: /nutzer suchen/i })
            ).toBeVisible();
            userEvent.type(
                screen.getByRole('combobox', { name: /nutzer suchen/i }),
                'Michel'
            );
            expect(
                screen.getByRole('combobox', { name: /nutzer suchen/i })
            ).toHaveFocus();
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
