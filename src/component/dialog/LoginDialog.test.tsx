import * as React from 'react';
import { render, waitFor } from 'test/util';
import { LoginDialog } from './LoginDialog';
import { SomeUser } from 'test/fixtures';
import LoginMutation from 'api/mutation/LoginMutation.graphql';
import userEvent from '@testing-library/user-event';

describe('component/dialog/LoginDialog', () => {
    it('should render login dialog without errors', () => {
        render(<LoginDialog isOpen={true} onRequestClose={() => {}} />, {});
    });

    it('should close the dialog when clicking on cancel', () => {
        const onRequestClose = jest.fn();
        const screen = render(
            <LoginDialog isOpen={true} onRequestClose={onRequestClose} />,
            {}
        );
        userEvent.click(screen.getByRole('button', { name: /abbrechen/i }));
        expect(onRequestClose).toHaveBeenCalled();
    });

    describe('fields', () => {
        it('should send a complete login, then show a confirm message', async () => {
            const additionalMocks = [
                {
                    request: {
                        query: LoginMutation,
                        variables: {
                            username: 'nutzer@email.de',
                            password: 'password',
                        },
                    },
                    result: { data: { login: {} } },
                },
            ];
            const onRequestClose = jest.fn();
            const screen = render(
                <LoginDialog isOpen={true} onRequestClose={onRequestClose} />,
                {},
                { additionalMocks, currentUser: SomeUser }
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /email/i }),
                'nutzer@email.de'
            );
            userEvent.type(screen.getByLabelText(/passwort/i), 'password');
            userEvent.click(screen.getByRole('button', { name: /anmelden/i }));
            await waitFor(() => {
                expect(onRequestClose).toHaveBeenCalled();
            });
        });

        it('should send a complete login, then show the password change dialog if the user logs in for the first time', async () => {
            const additionalMocks = [
                {
                    request: {
                        query: LoginMutation,
                        variables: {
                            username: 'nutzer@email.de',
                            password: 'password',
                        },
                    },
                    result: { data: { login: {} } },
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
            userEvent.type(
                screen.getByRole('textbox', { name: /email/i }),
                'nutzer@email.de'
            );
            userEvent.type(screen.getByLabelText(/passwort/i), 'password');
            userEvent.click(screen.getByRole('button', { name: /anmelden/i }));
            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: /passwort ändern/i })
                ).not.toBeNull();
            });
        });
    });
});
