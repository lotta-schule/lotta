import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, waitFor } from 'test/util';
import { Constraints } from './Constraints';
import { system } from 'test/fixtures';
import { UpdateSystemMutation } from 'api/mutation/UpdateSystemMutation';

describe('component/layouts/adminLayout/userManagement/Constraints', () => {
    it('should render without error', () => {
        render(<Constraints />, {}, { useCache: true });
    });

    describe('should not impose limit', () => {
        it('should have "no limit" checkbox checked when limit is -1', async () => {
            const screen = render(
                <Constraints />,
                {},
                {
                    useCache: true,
                    system: { ...system, userMaxStorageConfig: -1 },
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
                    useCache: true,
                    system: { ...system, userMaxStorageConfig: -1 },
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
            const screen = render(<Constraints />, {});
            expect(
                screen.getByRole('checkbox', { name: /begrenzen auf/i })
            ).toBeChecked();
            expect(
                screen.getByRole('checkbox', { name: /nicht begrenzen/i })
            ).not.toBeChecked();
        });

        it('should remember the limit set when disabling and reenabling the limit', () => {
            const screen = render(<Constraints />, {});
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

        it('have the system value prefilled', () => {
            const screen = render(<Constraints />, {}, { useCache: true });
            expect(
                screen.getByRole('spinbutton', { name: /freier speicher/i })
            ).toHaveValue(20);
        });

        describe('update the value', () => {
            it('should work by request when changing via input field', async () => {
                const updateFn = jest.fn(() => ({
                    data: {
                        system: { ...system, userMaxStorageConfig: 20123 },
                    },
                }));
                const mocks = [
                    {
                        request: {
                            query: UpdateSystemMutation,
                            variables: {
                                system: { userMaxStorageConfig: 20123 },
                            },
                        },
                        result: updateFn,
                    },
                ];
                const screen = render(
                    <Constraints />,
                    {},
                    { useCache: true, additionalMocks: mocks }
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
