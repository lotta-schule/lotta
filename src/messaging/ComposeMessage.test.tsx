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
        expect(screen.queryByRole('textbox')).toBeVisible();
        expect(screen.queryByRole('textbox')).toHaveFocus();
    });

    describe('send form', () => {
        it('should send a user a message', async () => {
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
            userEvent.type(screen.getByRole('textbox'), 'Hallo!');
            userEvent.click(screen.getByRole('button'));

            await waitFor(() => {
                expect(didCallMutation).toEqual(true);
            });
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('textbox')).toHaveValue('');
        });

        it('should send form on ENTER', async () => {
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
            userEvent.type(screen.getByRole('textbox'), 'Hallo!{enter}');
            await waitFor(() => {
                expect(didCallMutation).toEqual(true);
            });
            expect(onSent).toHaveBeenCalled();
        });

        it('should not send form on ENTER when SHIFT modifier is pressed', async () => {
            const screen = render(
                <ComposeMessage
                    destination={{
                        user: SomeUserin,
                    }}
                />,
                {},
                { currentUser: SomeUser }
            );
            userEvent.type(
                screen.getByRole('textbox'),
                'Hallo!{shift}{enter}Zweite Zeile'
            );
            expect(screen.getByRole('textbox')).toHaveValue(
                'Hallo!\nZweite Zeile'
            );
        });
    });
});
