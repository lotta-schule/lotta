import * as React from 'react';
import { render, screen, waitFor } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { UpdatePasswordDialog } from './UpdatePasswordDialog';
import { MockedResponse } from '@apollo/client/testing';
import RequestHisecTokenMutation from 'api/mutation/RequestHisecTokenMutation.graphql';
import UpdatePasswordMutation from 'api/mutation/UpdatePasswordMutation.graphql';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/adminLayout/userManagment/UpdatePasswordDialog', () => {
    it('should render the shared', () => {
        render(<UpdatePasswordDialog isOpen onRequestClose={() => {}} />);
    });

    it('should show the shared if isOpen is true', () => {
        render(<UpdatePasswordDialog isOpen onRequestClose={() => {}} />);
        expect(screen.queryByRole('dialog')).toBeVisible();
    });

    it('should not show the shared if isOpen is false', () => {
        render(
            <UpdatePasswordDialog isOpen={false} onRequestClose={() => {}} />
        );
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('should have the focus on the input field and the submit button disabled when open', () => {
        render(<UpdatePasswordDialog isOpen onRequestClose={() => {}} />);
        expect(screen.queryByLabelText('Neues Passwort:')).toBeInTheDocument();
        expect(
            screen.queryByLabelText('Wiederholung Neues Passwort:')
        ).toBeInTheDocument();
        expect(screen.queryByLabelText('Neues Passwort:')).toHaveFocus();
    });

    it('should have the autocomplete props on the inputs', () => {
        render(<UpdatePasswordDialog isOpen onRequestClose={() => {}} />);
        expect(screen.queryByLabelText('Neues Passwort:')).toHaveAttribute(
            'autocomplete',
            'new-password'
        );
        expect(
            screen.queryByLabelText('Wiederholung Neues Passwort:')
        ).toHaveAttribute('autocomplete', 'new-password');
    });

    it('should start with a disabled submit button, but should enable the button when passwords have been entered', () => {
        render(<UpdatePasswordDialog isOpen onRequestClose={() => {}} />);
        expect(screen.getByRole('button', { name: /ändern/ })).toBeDisabled();
        userEvent.type(screen.getByLabelText('Neues Passwort:'), 'pw456');
        userEvent.type(
            screen.getByLabelText('Wiederholung Neues Passwort:'),
            'pw456'
        );
        expect(
            screen.getByRole('button', { name: /ändern/ })
        ).not.toBeDisabled();
    });

    it('should not enable submit button if new password and repetition do not match', () => {
        render(<UpdatePasswordDialog isOpen onRequestClose={() => {}} />);
        expect(screen.getByRole('button', { name: /ändern/ })).toBeDisabled();
        userEvent.type(screen.getByLabelText('Neues Passwort:'), 'pw456');
        userEvent.type(
            screen.getByLabelText('Wiederholung Neues Passwort:'),
            'pw4567'
        );
        expect(screen.getByRole('button', { name: /ändern/ })).toBeDisabled();
    });

    describe('first login', () => {
        it('should not show the abort button', async () => {
            const screen = render(
                <UpdatePasswordDialog
                    isFirstPasswordChange
                    isOpen
                    onRequestClose={() => {}}
                />
            );
            expect(
                screen.queryByRole('button', { name: /abbrechen/i })
            ).toBeNull();
        });
    });

    describe('send form', () => {
        it('should create an article with the given title and then close the dialog', async () => {
            let updateMutationCalled = false;
            const additionalMocks: MockedResponse[] = [
                {
                    request: {
                        query: UpdatePasswordMutation,
                        variables: {
                            newPassword: 'pw456',
                        },
                    },
                    result: () => {
                        updateMutationCalled = true;
                        return {
                            data: { updatePassword: { id: 1 } },
                        };
                    },
                },
                {
                    request: {
                        query: RequestHisecTokenMutation,
                        variables: {
                            password: 'pw123',
                        },
                    },
                    result: { data: { token: 'abc' } },
                },
            ];
            const onClose = jest.fn();
            render(
                <UpdatePasswordDialog isOpen onRequestClose={onClose} />,
                {},
                { currentUser: SomeUser, additionalMocks }
            );
            userEvent.type(screen.getByLabelText('Neues Passwort:'), 'pw456');
            userEvent.type(
                screen.getByLabelText('Wiederholung Neues Passwort:'),
                'pw456'
            );
            userEvent.click(screen.getByRole('button', { name: /ändern/ }));
            await waitFor(() => {
                expect(
                    screen.getByTestId('RequestHisecTokenDialog')
                ).toBeVisible();
            });
            userEvent.type(screen.getByLabelText('Passwort:'), 'pw123');
            userEvent.click(screen.getByRole('button', { name: /senden/i }));

            await waitFor(() => {
                expect(updateMutationCalled).toEqual(true);
            });
            await waitFor(() => {
                expect(onClose).toHaveBeenCalled();
            });
        });

        it('should clear the form and call onAbort when clicking the "Reset" button', () => {
            render(<UpdatePasswordDialog isOpen onRequestClose={() => {}} />);
            userEvent.type(screen.getByLabelText('Neues Passwort:'), '');
            userEvent.type(
                screen.getByLabelText('Wiederholung Neues Passwort:'),
                ''
            );
            userEvent.click(screen.getByRole('button', { name: /ändern/i }));
        });
    });
});
