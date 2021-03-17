import * as React from 'react';
import { RegisterMutation } from 'api/mutation/RegisterMutation';
import { render, waitFor } from 'test/util';
import { RegisterDialog } from './RegisterDialog';
import userEvent from '@testing-library/user-event';

describe('component/dialog/RegisterDialog', () => {
    it('should render login dialog without errors', () => {
        render(<RegisterDialog isOpen={true} onRequestClose={() => {}} />, {});
    });

    it('should close the dialog when clicking on cancel', () => {
        const onRequestClose = jest.fn();
        const screen = render(
            <RegisterDialog isOpen={true} onRequestClose={onRequestClose} />,
            {}
        );
        userEvent.click(screen.getByRole('button', { name: /abbrechen/i }));
        expect(onRequestClose).toHaveBeenCalled();
    });

    describe('fields', () => {
        it('should send a complete registration, then show a confirm message', async () => {
            const onRequestClose = jest.fn();
            const additionalMocks = [
                {
                    request: {
                        query: RegisterMutation,
                        variables: {
                            user: {
                                email: 'nutzer@email.de',
                                name: 'Max Mustermann',
                                nickname: 'Los Maxos',
                                hideFullName: false,
                            },
                            groupKey: 'ABCDEF',
                        },
                    },
                    result: { data: { register: true } },
                },
            ];
            const screen = render(
                <RegisterDialog
                    isOpen={true}
                    onRequestClose={onRequestClose}
                />,
                {},
                { additionalMocks }
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /email/i }),
                'nutzer@email.de'
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /vorname/i }),
                'Max'
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /nachname/i }),
                'Mustermann'
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /spitzname/i }),
                'Los Maxos'
            );
            userEvent.click(
                screen.getByRole('checkbox', { name: /öffentlich verstecken/i })
            );
            userEvent.type(
                screen.getByRole('textbox', { name: /anmeldeschlüssel/i }),
                'ABCDEF'
            );
            userEvent.click(
                screen.getByRole('button', { name: /registrieren/i })
            );
            await waitFor(() => {
                // expect(screen.queryByRole('form')).toBeNull();
                expect(screen.queryByRole('dialog')).toHaveTextContent(
                    /erfolgreich eingerichtet/
                );
            });
        });
    });
});
