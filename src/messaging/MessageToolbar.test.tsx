import * as React from 'react';
import { render, waitFor } from 'test/util';
import { schuelerGroup, SomeUser, SomeUserin } from 'test/fixtures';
import { MessageToolbar } from './MessageToolbar';
import SearchUsersQuery from 'api/query/SearchUsersQuery.graphql';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/adminLayout/MessageToolbar', () => {
    const SomeUserWithGroups = { ...SomeUser, groups: [schuelerGroup] };

    it('should render without error', () => {
        render(
            <MessageToolbar
                onToggle={() => {}}
                onRequestNewMessage={() => {}}
            />,
            {},
            { currentUser: SomeUserWithGroups }
        );
    });

    it('should open the create popup when clicking on the "add" button', async () => {
        const screen = render(
            <MessageToolbar
                onToggle={() => {}}
                onRequestNewMessage={() => {}}
            />,
            {},
            { currentUser: SomeUserWithGroups }
        );

        userEvent.click(
            screen.getByRole('button', { name: /nachricht schreiben/i })
        );
        await waitFor(() => {
            expect(
                screen.getByRole('presentation', { name: /empfänger wählen/i })
            ).toBeVisible();
        });
    });

    describe('select detination popup', () => {
        it('should not show the "groups" tab if userAvatar has no groups', async () => {
            const screen = render(
                <MessageToolbar
                    onToggle={() => {}}
                    onRequestNewMessage={() => {}}
                />,
                {},
                { currentUser: SomeUser }
            );

            userEvent.click(
                screen.getByRole('button', { name: /nachricht schreiben/i })
            );
            await waitFor(() => {
                expect(
                    screen.getByRole('presentation', { name: /empfänger/i })
                ).toBeVisible();
            });

            expect(screen.queryByRole('tab', { name: /gruppe/i })).toBeNull();
        });

        it('should select a userAvatar and create the corresponding thread object', async () => {
            const additionalMocks = [
                {
                    request: {
                        query: SearchUsersQuery,
                        variables: { searchtext: 'Drinalda' },
                    },
                    result: {
                        data: { users: [SomeUserWithGroups, SomeUserin] },
                    },
                },
            ];
            const onRequestNewMessage = jest.fn((destination) => {
                expect(destination.user.name).toEqual('Luisa Drinalda');
                expect(destination.group).not.toBeDefined();
            });
            const screen = render(
                <MessageToolbar
                    onToggle={() => {}}
                    onRequestNewMessage={onRequestNewMessage}
                />,
                {},
                { currentUser: SomeUserin, additionalMocks }
            );

            userEvent.click(
                screen.getByRole('button', { name: /nachricht schreiben/i })
            );
            await waitFor(() => {
                expect(
                    screen.getByRole('presentation', { name: /empfänger/i })
                ).toBeVisible();
            });

            userEvent.click(screen.getByRole('tab', { name: /nutzer/i }));
            userEvent.type(
                screen.getByRole('combobox', { name: /nutzer suchen/i }),
                'Drinalda'
            );
            await waitFor(() => {
                expect(screen.queryByRole('progressbar')).toBeNull();
            });
            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /drinalda/i })
                ).toBeVisible();
            });
            userEvent.click(screen.getByRole('option', { name: /drinalda/i }));
            expect(onRequestNewMessage).toHaveBeenCalled();
        });

        it('should select a group and create the corresponding thread object', async () => {
            const onRequestNewMessage = jest.fn((destination) => {
                expect(destination.user).not.toBeDefined();
                expect(destination.group.name).toEqual('Schüler');
            });
            const screen = render(
                <MessageToolbar
                    onToggle={() => {}}
                    onRequestNewMessage={onRequestNewMessage}
                />,
                {},
                { currentUser: SomeUserWithGroups }
            );

            userEvent.click(
                screen.getByRole('button', { name: /nachricht schreiben/i })
            );
            await waitFor(() => {
                expect(
                    screen.getByRole('presentation', { name: /empfänger/i })
                ).toBeVisible();
            });

            userEvent.click(screen.getByRole('tab', { name: /gruppe/i }));

            await waitFor(() => {
                expect(
                    screen.getByRole('combobox', { name: /gruppe wählen/i })
                ).toBeVisible();
            });
            userEvent.click(
                screen.getByRole('button', { name: /vorschläge/i })
            );
            expect(screen.getAllByRole('option')).toHaveLength(1);
            userEvent.click(screen.getByRole('option', { name: 'Schüler' }));
            expect(onRequestNewMessage).toHaveBeenCalled();
        });
    });
});
