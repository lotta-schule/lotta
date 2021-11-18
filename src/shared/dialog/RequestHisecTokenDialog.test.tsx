import * as React from 'react';
import { render, screen, waitFor } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { RequestHisecTokenDialog } from './RequestHisecTokenDialog';
import userEvent from '@testing-library/user-event';

import RequestHisecTokenMutation from 'api/mutation/RequestHisecTokenMutation.graphql';

describe('shared/dialog/RequestHisecToken', () => {
    it('should render the shared', () => {
        render(
            <RequestHisecTokenDialog isOpen onRequestClose={() => {}} />,
            {},
            { currentUser: SomeUser }
        );
    });

    describe('show/hide', () => {
        it('should show the shared if isOpen is true', () => {
            render(
                <RequestHisecTokenDialog isOpen onRequestClose={() => {}} />,
                {},
                { currentUser: SomeUser }
            );
            expect(screen.queryByRole('dialog')).toBeVisible();
        });

        it('should not show the shared if isOpen is false', () => {
            render(
                <RequestHisecTokenDialog
                    isOpen={false}
                    onRequestClose={() => {}}
                />,
                {},
                { currentUser: SomeUser }
            );
            expect(screen.queryByRole('dialog')).toBeNull();
        });

        it('should reset the password field when opening the dialog again', async () => {
            const screen = render(
                <RequestHisecTokenDialog
                    isOpen={true}
                    onRequestClose={() => {}}
                />,
                {},
                { currentUser: SomeUser }
            );

            userEvent.type(screen.getByLabelText('Passwort:'), 'test');

            screen.rerender(
                <RequestHisecTokenDialog
                    isOpen={false}
                    onRequestClose={() => {}}
                />
            );
            screen.rerender(
                <RequestHisecTokenDialog
                    isOpen={true}
                    onRequestClose={() => {}}
                />
            );
            expect(screen.getByLabelText('Passwort:')).toHaveValue('');
        });
    });

    it('should have the focus on the input field and the submit button disabled when open', () => {
        render(
            <RequestHisecTokenDialog isOpen onRequestClose={() => {}} />,
            {},
            { currentUser: SomeUser }
        );
        expect(screen.getByLabelText('Passwort:')).toHaveFocus();
        expect(
            screen.queryByRole('button', { name: /senden/i })
        ).toBeDisabled();
    });

    it('should have the autocomplete props on the inputs', () => {
        render(
            <RequestHisecTokenDialog isOpen onRequestClose={() => {}} />,
            {},
            { currentUser: SomeUser }
        );
        expect(screen.getByLabelText('Passwort:')).toHaveAttribute(
            'autocomplete',
            'current-password'
        );
    });

    it('button should be enabled when a password is entered', () => {
        render(
            <RequestHisecTokenDialog isOpen onRequestClose={() => {}} />,
            {},
            { currentUser: SomeUser }
        );
        expect(screen.getByRole('button', { name: /senden/ })).toBeDisabled();
        userEvent.type(screen.getByLabelText('Passwort:'), 'pw123');
        expect(
            screen.getByRole('button', { name: /senden/ })
        ).not.toBeDisabled();
    });

    describe('send form', () => {
        it('should close the dialog returning the token', async () => {
            const additionalMocks = [
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
            const screen = render(
                <RequestHisecTokenDialog isOpen onRequestClose={onClose} />,
                {},
                { currentUser: SomeUser, additionalMocks }
            );
            userEvent.type(screen.getByLabelText('Passwort:'), 'pw123');
            userEvent.click(screen.getByRole('button', { name: /senden/ }));

            await waitFor(() => {
                expect(onClose).toHaveBeenCalledWith('abc');
            });
        });

        it('should send the form automatically and return the token when the pw is given', async () => {
            const additionalMocks = [
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
                <RequestHisecTokenDialog
                    isOpen
                    withCurrentPassword={'pw123'}
                    onRequestClose={onClose}
                />,
                {},
                { currentUser: SomeUser, additionalMocks }
            );

            await waitFor(() => {
                expect(onClose).toHaveBeenCalledWith('abc');
            });
        });

        it('should clear the form and call onAbort when clicking the "Abort" button', () => {
            const onClose = jest.fn();
            render(
                <RequestHisecTokenDialog isOpen onRequestClose={onClose} />,
                {},
                { currentUser: SomeUser }
            );
            userEvent.click(screen.getByRole('button', { name: /abbrechen/i }));
            expect(onClose).toHaveBeenCalledWith(null);
        });
    });
});
