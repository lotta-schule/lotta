import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, waitFor } from 'test/util';
import { Constraints } from '../pages/admin/users/constraints';
import { tenant } from 'test/fixtures';
import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

describe('pages/admin/users/constraints', () => {
    it('should render without error', () => {
        render(<Constraints />, {}, {});
    });

    describe('should not impose limit', () => {
        it('should have "no limit" checkbox checked when limit is -1', async () => {
            const screen = render(
                <Constraints />,
                {},
                {
                    tenant: {
                        ...tenant,
                        configuration: {
                            ...tenant.configuration,
                            userMaxStorageConfig: '-1',
                        },
                    },
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
                <Constraints />,
                {},
                {
                    tenant: {
                        ...tenant,
                        configuration: {
                            ...tenant.configuration,
                            userMaxStorageConfig: '-1',
                        },
                    },
                }
            );
            userEvent.click(
                screen.getByRole('checkbox', { name: /begrenzen auf:/i })
            );
            expect(
                screen.getByRole('spinbutton', { name: /freier speicher/i })
            ).toHaveValue(20);
        });
    });

    describe('should impose limit', () => {
        it('should have "no limit" checkbox checked when limit is 20', () => {
            const screen = render(<Constraints />, {}, {});
            expect(
                screen.getByRole('checkbox', { name: /begrenzen auf/i })
            ).toBeChecked();
            expect(
                screen.getByRole('checkbox', { name: /nicht begrenzen/i })
            ).not.toBeChecked();
        });

        it('should remember the limit set when disabling and reenabling the limit', () => {
            const screen = render(<Constraints />, {}, {});
            userEvent.type(
                screen.getByRole('spinbutton', {
                    name: /freier speicher/i,
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
                screen.getByRole('spinbutton', { name: /freier speicher/i })
            ).toHaveValue(20123);
        });

        it('have the tenant value prefilled', () => {
            const screen = render(<Constraints />, {}, {});
            expect(
                screen.getByRole('spinbutton', { name: /freier speicher/i })
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
                    <Constraints />,
                    {},
                    { additionalMocks: mocks }
                );
                userEvent.type(
                    screen.getByRole('spinbutton', {
                        name: /freier speicher/i,
                    }),
                    '123'
                );
                userEvent.tab();
                expect(
                    screen.getByRole('spinbutton', { name: /freier speicher/i })
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
