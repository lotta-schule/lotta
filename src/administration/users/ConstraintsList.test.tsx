import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, waitFor } from 'test/util';
import { adminGroup, SomeUser, tenant } from 'test/fixtures';
import { ConstraintList } from './ConstraintsList';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

const adminUser = { ...SomeUser, groups: [adminGroup] };

describe('pages/admin/users/constraints', () => {
    it('should render without error', () => {
        render(<ConstraintList />, {}, { currentUser: adminUser });
    });

    describe('should not impose limit', () => {
        it('should have "no limit" checkbox checked when limit is -1', async () => {
            const screen = render(
                <ConstraintList />,
                {},
                {
                    tenant: {
                        ...tenant,
                        configuration: {
                            ...tenant.configuration,
                            userMaxStorageConfig: '-1',
                        },
                    },
                    currentUser: adminUser,
                }
            );
            await waitFor(() => {
                expect(
                    screen.getByRole('checkbox', { name: /nicht begrenzen/i })
                ).toBeChecked();
                expect(
                    screen.getByRole('checkbox', { name: /begrenzen auf/i })
                ).not.toBeChecked();
            });
        });

        it('should set a limit when clicking corresponding checkbox', () => {
            const screen = render(
                <ConstraintList />,
                {},
                {
                    tenant: {
                        ...tenant,
                        configuration: {
                            ...tenant.configuration,
                            userMaxStorageConfig: '-1',
                        },
                    },
                    currentUser: adminUser,
                }
            );
            userEvent.click(
                screen.getByRole('checkbox', { name: /begrenzen auf:/i })
            );
            expect(
                screen.getByRole('spinbutton', { name: /begrenzung/i })
            ).toHaveValue(20);
        });
    });

    describe('should impose limit', () => {
        it('should have "no limit" checkbox checked when limit is 20', () => {
            const screen = render(
                <ConstraintList />,
                {},
                { currentUser: adminUser }
            );
            expect(
                screen.getByRole('checkbox', { name: /begrenzen auf/i })
            ).toBeChecked();
            expect(
                screen.getByRole('checkbox', { name: /nicht begrenzen/i })
            ).not.toBeChecked();
        });

        it('should remember the limit set when disabling and reenabling the limit', () => {
            const screen = render(
                <ConstraintList />,
                {},
                { currentUser: adminUser }
            );
            userEvent.type(
                screen.getByRole('spinbutton', {
                    name: /begrenzung/i,
                }),
                '123'
            );
            userEvent.tab();
            userEvent.click(
                screen.getByRole('checkbox', { name: /nicht begrenzen/i })
            );
            userEvent.click(
                screen.getByRole('checkbox', { name: /begrenzen auf/i })
            );
            expect(
                screen.getByRole('spinbutton', { name: /begrenzung/i })
            ).toHaveValue(20123);
        });

        it('have the tenant value prefilled', () => {
            const screen = render(
                <ConstraintList />,
                {},
                { currentUser: adminUser }
            );
            expect(
                screen.getByRole('spinbutton', { name: /begrenzung/i })
            ).toHaveValue(20);
        });

        describe('update the value', () => {
            it('should work by request when changing via input field', async () => {
                const updateFn = jest.fn(() => ({
                    data: {
                        tenant: {
                            ...tenant,
                            configuration: {
                                ...tenant.configuration,
                                userMaxStorageConfig: '20123',
                            },
                        },
                    },
                }));
                const mocks = [
                    {
                        request: {
                            query: UpdateTenantMutation,
                            variables: {
                                tenant: {
                                    configuration: {
                                        ...tenant.configuration,
                                        userMaxStorageConfig: '21100494848',
                                    },
                                },
                            },
                        },
                        result: updateFn,
                    },
                ];
                const screen = render(
                    <ConstraintList />,
                    {},
                    { additionalMocks: mocks, currentUser: adminUser }
                );
                userEvent.type(
                    screen.getByRole('spinbutton', {
                        name: /begrenzung/i,
                    }),
                    '123'
                );
                userEvent.tab();
                expect(
                    screen.getByRole('spinbutton', { name: /begrenzung/i })
                ).not.toHaveFocus();
                userEvent.click(
                    screen.getByRole('button', { name: /speichern/i })
                );
                expect(
                    screen.getByRole('button', { name: /speichern/i })
                ).toBeDisabled();
                await waitFor(() => {
                    expect(updateFn).toHaveBeenCalled();
                });
            });
        });
    });
});
