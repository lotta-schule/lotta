import * as React from 'react';
import {
    adminGroup,
    elternGroup,
    lehrerGroup,
    schuelerGroup,
} from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { EditUserGroupDialog } from './EditUserGroupDialog';
import UpdateUserGroupMutation from 'api/mutation/UpdateUserGroupMutation.graphql';
import GetGroupQuery from 'api/query/GetGroupQuery.graphql';
import userEvent from '@testing-library/user-event';

const additionalMocks = [
    {
        request: { query: GetGroupQuery, variables: { id: adminGroup.id } },
        result: { data: { group: adminGroup } },
    },
    {
        request: { query: GetGroupQuery, variables: { id: lehrerGroup.id } },
        result: { data: { group: lehrerGroup } },
    },
];

describe('shared/layouts/adminLayouts/userManagment/EditUserGroupDialog', () => {
    describe('dialog', () => {
        it('should not show the dialog when no group is passed', () => {
            const screen = render(
                <EditUserGroupDialog group={null} onRequestClose={jest.fn()} />,
                {},
                { additionalMocks }
            );
            expect(
                screen.queryByRole('dialog', {
                    name: /bearbeiten/i,
                })
            ).toBeNull();
        });

        it('should show the dialog when a group is passed', async () => {
            const screen = render(
                <EditUserGroupDialog
                    group={lehrerGroup}
                    onRequestClose={jest.fn()}
                />,
                {},
                { additionalMocks }
            );
            await waitFor(() => {
                expect(
                    screen.getByRole('dialog', {
                        name: 'Gruppe "Lehrer" bearbeiten',
                    })
                ).toBeVisible();
            });
        });
    });

    describe('Form', () => {
        describe('Group Title', () => {
            it('should be showing the title in a textbox', async () => {
                const screen = render(
                    <EditUserGroupDialog
                        group={lehrerGroup}
                        onRequestClose={jest.fn()}
                    />,
                    {},
                    { additionalMocks }
                );
                expect(
                    await screen.findByRole('textbox', { name: /gruppenname/i })
                ).toHaveValue('Lehrer');
            });

            it('should update the title on blur', async () => {
                const saveCallback = jest.fn(() => ({
                    data: { group: { ...lehrerGroup, name: 'Neuer Name' } },
                }));
                const saveMock = {
                    request: {
                        query: UpdateUserGroupMutation,
                        variables: {
                            id: lehrerGroup.id,
                            group: {
                                name: 'Neuer Name',
                                isAdminGroup: lehrerGroup.isAdminGroup,
                                enrollmentTokens: lehrerGroup.enrollmentTokens,
                            },
                        },
                    },
                    result: saveCallback,
                };
                const screen = render(
                    <EditUserGroupDialog
                        group={lehrerGroup}
                        onRequestClose={jest.fn()}
                    />,
                    {},
                    { additionalMocks: [...additionalMocks, saveMock] }
                );
                userEvent.type(
                    await screen.findByRole('textbox', {
                        name: /gruppenname/i,
                    }),
                    '{selectall}Neuer Name'
                );
                userEvent.tab();
                await waitFor(() => {
                    expect(saveCallback).toHaveBeenCalled();
                });
            });

            it('should update the title on ENTER', async () => {
                const saveCallback = jest.fn(() => ({
                    data: { group: { ...lehrerGroup, name: 'Neuer Name' } },
                }));
                const saveMock = {
                    request: {
                        query: UpdateUserGroupMutation,
                        variables: {
                            id: lehrerGroup.id,
                            group: {
                                name: 'Neuer Name',
                                isAdminGroup: lehrerGroup.isAdminGroup,
                                enrollmentTokens: lehrerGroup.enrollmentTokens,
                            },
                        },
                    },
                    result: saveCallback,
                };
                const screen = render(
                    <EditUserGroupDialog
                        group={lehrerGroup}
                        onRequestClose={jest.fn()}
                    />,
                    {},
                    { additionalMocks: [...additionalMocks, saveMock] }
                );
                userEvent.type(
                    await screen.findByRole('textbox', {
                        name: /gruppenname/i,
                    }),
                    '{selectall}Neuer Name{enter}'
                );
                await waitFor(() => {
                    expect(saveCallback).toHaveBeenCalled();
                });
            });
        });

        describe('admin setting', () => {
            const otherAdminGroup = {
                ...adminGroup,
                name: 'Admin2',
                id: adminGroup.id + 'xxx',
            };
            const groups = [
                adminGroup,
                lehrerGroup,
                elternGroup,
                schuelerGroup,
            ];
            const groupsWithSecondAdmin = [...groups, otherAdminGroup];
            it('should have the admin checkbox checked for a admin group', async () => {
                const screen = render(
                    <EditUserGroupDialog
                        group={adminGroup}
                        onRequestClose={jest.fn()}
                    />,
                    {},
                    { additionalMocks, userGroups: groupsWithSecondAdmin }
                );
                expect(
                    await screen.findByRole('checkbox', {
                        name: /administratorrecht/i,
                    })
                ).toBeChecked();
            });

            it('should update the admin setting', async () => {
                const saveCallback = jest.fn(() => ({
                    data: { group: { ...adminGroup, adminGroup: false } },
                }));
                const saveMock = {
                    request: {
                        query: UpdateUserGroupMutation,
                        variables: {
                            id: adminGroup.id,
                            group: {
                                name: adminGroup.name,
                                isAdminGroup: false,
                                enrollmentTokens: adminGroup.enrollmentTokens,
                            },
                        },
                    },
                    result: saveCallback,
                };
                const screen = render(
                    <EditUserGroupDialog
                        group={adminGroup}
                        onRequestClose={jest.fn()}
                    />,
                    {},
                    {
                        additionalMocks: [...additionalMocks, saveMock],
                        userGroups: groupsWithSecondAdmin,
                    }
                );
                userEvent.click(
                    await screen.findByRole('checkbox', {
                        name: /administratorrechte/i,
                    })
                );
                await waitFor(() => {
                    expect(saveCallback).toHaveBeenCalled();
                });
            });

            it('should disable the admin checkbox if there is only one admin available', async () => {
                const screen = render(
                    <EditUserGroupDialog
                        group={adminGroup}
                        onRequestClose={jest.fn()}
                    />,
                    {},
                    { additionalMocks }
                );
                expect(
                    await screen.findByRole('checkbox', {
                        name: /administratorrecht/i,
                    })
                ).toBeDisabled();
            });
        });

        describe('update the enrollment tokens', () => {
            it('should update the enrollment tokens', async () => {
                const saveCallback = jest.fn(() => ({
                    data: { group: { ...lehrerGroup, name: 'Lehrer' } },
                }));
                const saveMock = {
                    request: {
                        query: UpdateUserGroupMutation,
                        variables: {
                            id: lehrerGroup.id,
                            group: {
                                name: 'Lehrer',
                                isAdminGroup: lehrerGroup.isAdminGroup,
                                enrollmentTokens:
                                    lehrerGroup.enrollmentTokens.concat(
                                        'NeuerToken'
                                    ),
                            },
                        },
                    },
                    result: saveCallback,
                };
                const screen = render(
                    <EditUserGroupDialog
                        group={lehrerGroup}
                        onRequestClose={jest.fn()}
                    />,
                    {},
                    { additionalMocks: [...additionalMocks, saveMock] }
                );
                userEvent.type(
                    await screen.findByPlaceholderText(/einschreibeschlüssel/i),
                    'NeuerToken{enter}'
                );
                await waitFor(() => {
                    expect(saveCallback).toHaveBeenCalled();
                });
            });
        });

        describe('delete group', () => {
            it('should show a delete button for a group and show dialog', async () => {
                const screen = render(
                    <EditUserGroupDialog
                        group={lehrerGroup}
                        onRequestClose={jest.fn()}
                    />,
                    {},
                    { additionalMocks }
                );
                userEvent.click(
                    await screen.findByRole('button', { name: /löschen/i })
                );
                await waitFor(() => {
                    expect(
                        screen.getByRole('dialog', { name: /löschen/i })
                    ).toBeVisible();
                });
            });

            it('delete button should be disabled when group is sole admin group', async () => {
                const screen = render(
                    <EditUserGroupDialog
                        group={adminGroup}
                        onRequestClose={jest.fn()}
                    />,
                    {},
                    { additionalMocks }
                );
                expect(
                    await screen.findByPlaceholderText(/einschreibeschlüssel/i)
                ).toBeVisible();
                expect(
                    screen.queryByRole('button', { name: /löschen/i })
                ).toBeNull();
            });
        });
    });
});
