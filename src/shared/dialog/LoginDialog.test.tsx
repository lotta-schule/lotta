import * as React from 'react';
import { render, waitFor } from 'test/util';
import { LoginDialog } from './LoginDialog';
import { SomeUser } from 'test/fixtures';
import LoginMutation from 'api/mutation/LoginMutation.graphql';
import userEvent from '@testing-library/user-event';

describe('shared/dialog/LoginDialog', () => {
    it('should render login dialog without errors', () => {
        render(<LoginDialog isOpen={true} onRequestClose={() => {}} />, {});
    });

    it('should close the dialog when clicking on cancel', async () => {
        const fireEvent = userEvent.setup();
        const onRequestClose = jest.fn();
        const screen = render(
            <LoginDialog isOpen={true} onRequestClose={onRequestClose} />,
            {}
        );
        await fireEvent.click(
            screen.getByRole('button', { name: /abbrechen/i })
        );
        expect(onRequestClose).toHaveBeenCalled();
    });

    describe('fields', () => {
        it('should send a complete login, then show a confirm message', async () => {
            const fireEvent = userEvent.setup();
            const additionalMocks = [
                {
                    request: {
                        query: LoginMutation,
                        variables: {
                            username: 'nutzer@email.de',
                            password: 'password',
                        },
                    },
                    result: { data: { login: { accessToken: 'abc' } } },
                },
            ];
            const onRequestClose = jest.fn();
            const screen = render(
                <LoginDialog isOpen={true} onRequestClose={onRequestClose} />,
                {},
                { additionalMocks, currentUser: SomeUser }
            );
            await fireEvent.type(
                screen.getByRole('textbox', { name: /email/i }),
                'nutzer@email.de'
            );
            await fireEvent.type(
                screen.getByLabelText(/passwort/i),
                'password'
            );
            await fireEvent.click(
                screen.getByRole('button', { name: /anmelden/i })
            );
            await waitFor(() => {
                expect(onRequestClose).toHaveBeenCalled();
            });
        });

        it('should send a complete login, then show the password change dialog if the userAvatar logs in for the first time', async () => {
            const fireEvent = userEvent.setup();
            const additionalMocks = [
                {
                    request: {
                        query: LoginMutation,
                        variables: {
                            username: 'nutzer@email.de',
                            password: 'password',
                        },
                    },
                    result: { data: { login: { accessToken: 'abc' } } },
                },
            ];
            const onRequestClose = jest.fn();
            const screen = render(
                <LoginDialog isOpen={true} onRequestClose={onRequestClose} />,
                {},
                {
                    additionalMocks,
                    currentUser: {
                        ...SomeUser,
                        hasChangedDefaultPassword: false,
                    },
                }
            );
            await fireEvent.type(
                screen.getByRole('textbox', { name: /email/i }),
                'nutzer@email.de'
            );
            await fireEvent.type(
                screen.getByLabelText(/passwort/i),
                'password'
            );
            await fireEvent.click(
                screen.getByRole('button', { name: /anmelden/i })
            );
            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: /passwort ändern/i })
                ).not.toBeNull();
            });
        });
    });
});
