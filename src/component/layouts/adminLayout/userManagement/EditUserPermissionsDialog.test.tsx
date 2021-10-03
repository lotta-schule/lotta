import React from 'react';
import { MockedResponse } from '@apollo/client/testing';
import { render, waitFor } from 'test/util';
import { SomeUser, adminGroup, lehrerGroup, elternGroup } from 'test/fixtures';
import { EditUserPermissionsDialog } from './EditUserPermissionsDialog';
import UpdateUserMutation from 'api/mutation/UpdateUserMutation.graphql';
import GetUserQuery from 'api/query/GetUserQuery.graphql';
import userEvent from '@testing-library/user-event';

describe('component/layouts/adminLayout/userManagment/EditUserPermissionsDialog', () => {
    let userInfoLoaded = false;

    const mocks = (user: any) =>
        [
            {
                request: { query: GetUserQuery, variables: { id: user.id } },
                result: () => {
                    userInfoLoaded = true;
                    return { data: { user } };
                },
            },
        ] as MockedResponse[];

    beforeEach(() => {
        userInfoLoaded = false;
    });

    describe('show user basic information', () => {
        it('should show user information', async () => {
            const user = { ...SomeUser, groups: [], assignedGroups: [] };
            const screen = render(
                <EditUserPermissionsDialog user={user} onClose={() => {}} />,
                {},
                { additionalMocks: mocks(user) }
            );
            await waitFor(() => {
                expect(userInfoLoaded).toEqual(true);
            });
            expect(screen.queryByTestId('DialogTitle')).toHaveTextContent(
                'Ernesto Guevara'
            );
            expect(screen.queryByTestId('UserNickname')).toHaveTextContent(
                'Che'
            );
            expect(screen.queryByTestId('UserEmail')).toHaveTextContent(
                'user@lotta.schule'
            );
        });
    });

    describe('show and select correct groups', () => {
        it('should show assigned and dynamic groups', async () => {
            const user = {
                ...SomeUser,
                groups: [adminGroup, lehrerGroup],
                assignedGroups: [adminGroup],
            };
            const screen = render(
                <EditUserPermissionsDialog user={user} onClose={() => {}} />,
                {},
                { additionalMocks: mocks(user) }
            );
            await waitFor(() => {
                expect(screen.queryByTestId('DialogTitle')).toHaveTextContent(
                    'Ernesto Guevara'
                );
            });

            const assignedGroups = await screen.findByTestId(
                'GroupSelectSelection'
            );
            expect(assignedGroups).toHaveTextContent(/Administrator/);

            expect(screen.queryByTestId('DynamicGroups')).toHaveTextContent(
                `Über Einschreibeschlüssel zugewiesene Gruppen:Lehrer`
            );
        });

        it('should assign new group on click', async () => {
            let mutationHasBeenCalled = false;
            const user = {
                ...SomeUser,
                groups: [adminGroup, lehrerGroup],
                assignedGroups: [adminGroup],
            };
            const additionalMocks = [
                ...mocks(user),
                {
                    request: {
                        query: UpdateUserMutation,
                        variables: {
                            id: user.id,
                            groups: [adminGroup.id, elternGroup.id].map(
                                (id) => ({ id })
                            ),
                        },
                    },
                    result: () => {
                        mutationHasBeenCalled = true;
                        return {
                            data: {
                                user: {
                                    ...user,
                                    assignedGroups: [
                                        ...user.assignedGroups,
                                        elternGroup,
                                    ],
                                },
                            },
                        };
                    },
                },
            ];
            const screen = render(
                <EditUserPermissionsDialog user={user} onClose={() => {}} />,
                {},
                { additionalMocks }
            );
            await waitFor(() => {
                expect(userInfoLoaded).toEqual(true);
            });

            const assignedGroups = await screen.findByTestId(
                'GroupSelectSelection'
            );
            expect(assignedGroups).toHaveTextContent(/Administrator/i);

            userEvent.click(await screen.findByRole('textbox'));
            await waitFor(() => {
                expect(screen.queryByRole('listbox')).toBeVisible();
            });
            userEvent.click(
                await screen.findByRole('option', { name: 'Eltern' })
            );

            await waitFor(() => {
                expect(mutationHasBeenCalled).toEqual(true);
            });
        });

        it('should unassign new group on click', async () => {
            let mutationHasBeenCalled = false;
            const user = {
                ...SomeUser,
                groups: [adminGroup, lehrerGroup, elternGroup],
                assignedGroups: [adminGroup, elternGroup],
            };
            const additionalMocks = [
                ...mocks(user),
                {
                    request: {
                        query: UpdateUserMutation,
                        variables: {
                            id: SomeUser.id,
                            groups: [{ id: adminGroup.id }],
                        },
                    },
                    result: () => {
                        mutationHasBeenCalled = true;
                        return {
                            data: {
                                user: { ...user, assignedGroups: [adminGroup] },
                            },
                        };
                    },
                },
            ];
            const screen = render(
                <EditUserPermissionsDialog user={user} onClose={() => {}} />,
                {},
                { additionalMocks }
            );
            await waitFor(() => {
                expect(userInfoLoaded).toEqual(true);
            });
            const assignedGroups = await screen.findByTestId(
                'GroupSelectSelection'
            );
            expect(assignedGroups).toHaveTextContent('Administrator');

            userEvent.click(await screen.findByRole('textbox'));
            await waitFor(() => {
                expect(screen.queryByRole('listbox')).toBeVisible();
            });
            userEvent.click(
                await screen.findByRole('option', { name: 'Eltern' })
            );

            await waitFor(() => {
                expect(mutationHasBeenCalled).toEqual(true);
            });
        });
    });
});
