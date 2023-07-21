import * as React from 'react';
import { render, waitFor } from 'test/util';
import { SomeUser, SomeUserin } from 'test/fixtures';
import { ComposeMessage } from './ComposeMessage';
import { MessageModel } from 'model';
import userEvent from '@testing-library/user-event';

import SendMessageMutation from 'api/mutation/SendMessageMutation.graphql';

describe('shared/layouts/messagingLayout/ComposeMessage', () => {
    it('should render the shared', () => {
        render(
            <ComposeMessage
                destination={{
                    user: SomeUserin,
                }}
            />
        );
    });

    it('should auto focus input field', () => {
        const screen = render(
            <ComposeMessage
                destination={{
                    user: SomeUserin,
                }}
            />
        );
        expect(screen.getByRole('textbox')).toBeVisible();
        expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('should have a disabled send button when textbox is empty', () => {
        const screen = render(
            <ComposeMessage
                destination={{
                    user: SomeUserin,
                }}
            />
        );
        expect(screen.getByRole('button', { name: /senden/ })).toBeDisabled();
    });

    it('should enable the send button when text is entered', async () => {
        const fireEvent = userEvent.setup();
        const screen = render(
            <ComposeMessage
                destination={{
                    user: SomeUserin,
                }}
            />
        );
        await fireEvent.type(screen.getByRole('textbox'), 'Hallo!');
        expect(
            screen.getByRole('button', { name: /senden/ })
        ).not.toBeDisabled();
    });

    describe('send form', () => {
        it('should send a user a message', async () => {
            const fireEvent = userEvent.setup();
            let didCallMutation = false;
            const additionalMocks = [
                {
                    request: {
                        query: SendMessageMutation,
                        variables: {
                            message: {
                                content: 'Hallo!',
                                recipientUser: { id: SomeUserin.id },
                                recipientGroup: undefined,
                            },
                        },
                    },
                    result: () => {
                        didCallMutation = true;
                        return {
                            data: {
                                message: {
                                    id: 1,
                                    content: 'Hallo!',
                                    files: [],
                                    user: SomeUser,
                                    recipientGroup: null,
                                    insertedAt: new Date().toString(),
                                    updatedAt: new Date().toString(),
                                    conversation: {
                                        id: 99900,
                                        insertedAt: new Date().toString(),
                                        updatedAt: new Date().toString(),
                                        users: [SomeUser, SomeUserin],
                                        groups: [],
                                        messages: [],
                                        unreadMessages: 0,
                                    },
                                },
                            },
                        };
                    },
                },
            ];
            const screen = render(
                <ComposeMessage
                    destination={{
                        user: SomeUserin,
                    }}
                />,
                {},
                { currentUser: SomeUser, additionalMocks }
            );
            await fireEvent.type(screen.getByRole('textbox'), 'Hallo!');
            await fireEvent.click(
                screen.getByRole('button', { name: /senden/ })
            );

            await waitFor(() => {
                expect(didCallMutation).toEqual(true);
            });
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('textbox')).toHaveValue('');
        });

        it('should send form on ENTER', async () => {
            const fireEvent = userEvent.setup();
            let didCallMutation = false;
            const additionalMocks = [
                {
                    request: {
                        query: SendMessageMutation,
                        variables: {
                            message: {
                                content: 'Hallo!',
                                recipientUser: { id: SomeUserin.id },
                                recipientGroup: undefined,
                            },
                        },
                    },
                    result: () => {
                        didCallMutation = true;
                        return {
                            data: {
                                message: {
                                    id: 1,
                                    content: 'Hallo!',
                                    files: [],
                                    user: SomeUser,
                                    insertedAt: new Date().toString(),
                                    updatedAt: new Date().toString(),
                                    conversation: {
                                        id: 99901,
                                        insertedAt: new Date().toString(),
                                        updatedAt: new Date().toString(),
                                        users: [SomeUser, SomeUserin],
                                        groups: [],
                                        messages: [],
                                        unreadMessages: 0,
                                    },
                                },
                            },
                        };
                    },
                },
            ];
            const onSent = jest.fn((message: MessageModel) => {
                expect(message.id).toEqual(1);
            });
            const screen = render(
                <ComposeMessage
                    destination={{
                        user: SomeUserin,
                    }}
                    onSent={onSent}
                />,
                {},
                { currentUser: SomeUser, additionalMocks }
            );
            await fireEvent.type(screen.getByRole('textbox'), 'Hallo!{enter}');
            await waitFor(() => {
                expect(didCallMutation).toEqual(true);
            });
            expect(onSent).toHaveBeenCalled();
        });

        it('should not send form on ENTER when SHIFT modifier is pressed', async () => {
            const fireEvent = userEvent.setup();
            const onSent = jest.fn();
            const screen = render(
                <ComposeMessage
                    destination={{
                        user: SomeUserin,
                    }}
                />,
                {},
                { currentUser: SomeUser }
            );
            await fireEvent.type(
                screen.getByRole('textbox'),
                'Hallo!{Shift>}{Enter}{/Shift}Zweite Zeile'
            );
            expect(screen.getByRole('textbox')).toHaveValue(
                'Hallo!\nZweite Zeile'
            );
            expect(onSent).not.toHaveBeenCalled();
        });
    });
});
