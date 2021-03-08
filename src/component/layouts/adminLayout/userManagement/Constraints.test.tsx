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

    it('have the system value prefilled', () => {
        const screen = render(<Constraints />, {}, { useCache: true });
        expect(
            screen.getByRole('spinbutton', { name: /freier speicher/i })
        ).toHaveValue(20);
    });

    describe('update the value', () => {
        it('should work by request when changing via input field', async () => {
            const updateFn = jest.fn(() => ({
                data: { system: { ...system, userMaxStorageConfig: 20123 } },
            }));
            const mocks = [
                {
                    request: {
                        query: UpdateSystemMutation,
                        variables: { system: { userMaxStorageConfig: 20123 } },
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
                screen.getByRole('spinbutton', { name: /freier speicher/i }),
                '123'
            );
            userEvent.tab();
            expect(
                screen.getByRole('spinbutton', { name: /freier speicher/i })
            ).not.toHaveFocus();
            userEvent.click(screen.getByRole('button', { name: /speichern/i }));
            expect(
                screen.getByRole('button', { name: /speichern/i })
            ).toBeDisabled();
            await waitFor(() => {
                expect(updateFn).toHaveBeenCalled();
            });
        });
    });
});
