import * as React from 'react';
import { render, screen, waitFor } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { UpdateEmailDialog } from './UpdateEmailDialog';
import { MockedResponse } from '@apollo/client/testing';
import RequestHisecTokenMutation from 'api/mutation/RequestHisecTokenMutation.graphql';
import UpdateEmailMutation from 'api/mutation/UpdateEmailMutation.graphql';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/adminLayout/userManagment/UpdateEmailDialog', () => {
    it('should render the shared', () => {
        render(<UpdateEmailDialog isOpen onRequestClose={() => {}} />);
    });

    it('should show the shared if isOpen is true', async () => {
        render(<UpdateEmailDialog isOpen onRequestClose={() => {}} />);
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).toBeVisible();
        });
    });

    it('should not show the shared if isOpen is false', () => {
        render(<UpdateEmailDialog isOpen={false} onRequestClose={() => {}} />);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('should have the focus on the input field and the submit button disabled when open', () => {
        render(<UpdateEmailDialog isOpen onRequestClose={() => {}} />);
        expect(screen.getByLabelText('Neue Email:')).toHaveFocus();
    });

    it('should start with a disabled submit button, but should enable the button when emails have been entered', () => {
        render(<UpdateEmailDialog isOpen onRequestClose={() => {}} />);
        expect(screen.getByRole('button', { name: /ändern/ })).toBeDisabled();
        userEvent.type(screen.getByLabelText('Neue Email:'), 'abc@def.gh');
        expect(
            screen.getByRole('button', { name: /ändern/ })
        ).not.toBeDisabled();
    });

    describe('send form', () => {
        it('change the email and then close the dialog', async () => {
            let updateMutationCalled = false;
            const additionalMocks: MockedResponse[] = [
                {
                    request: {
                        query: UpdateEmailMutation,
                        variables: {
                            newEmail: 'ab@cd.ef',
                        },
                    },
                    result: () => {
                        updateMutationCalled = true;
                        return {
                            data: { updateEmail: { id: 1, email: 'ab@cd.ef' } },
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
                <UpdateEmailDialog isOpen onRequestClose={onClose} />,
                {},
                { currentUser: SomeUser, additionalMocks }
            );
            userEvent.type(screen.getByLabelText('Neue Email:'), 'ab@cd.ef');
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
            render(<UpdateEmailDialog isOpen onRequestClose={() => {}} />);
            expect(screen.getByLabelText('Neue Email:')).toHaveValue('');
            userEvent.click(screen.getByRole('button', { name: /ändern/i }));
        });
    });
});
