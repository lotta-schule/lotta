import React from 'react';
import { render, waitFor } from 'test/util';
import { SomeUser, SomeUserin } from 'test/fixtures';
import { ComposeMessage } from './ComposeMessage';
import { ChatType } from 'model';
import SendMessageMutation from 'api/mutation/SendMessageMutation.graphql';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/messagingLayout/ComposeMessage', () => {
    it('should render the shared', () => {
        render(
            <ComposeMessage
                threadRepresentation={{
                    messageType: ChatType.DirectMessage,
                    counterpart: SomeUserin,
                }}
            />
        );
    });

    it('should auto focus input field', () => {
        const screen = render(
            <ComposeMessage
                threadRepresentation={{
                    messageType: ChatType.DirectMessage,
                    counterpart: SomeUserin,
                }}
            />
        );
        expect(screen.queryByRole('textbox')).toBeVisible();
        expect(screen.queryByRole('textbox')).toHaveFocus();
    });

    describe('send form', () => {
        it('should send a userAvatar a comment', async () => {
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
                                    senderUser: SomeUser,
                                    recipientUser: SomeUserin,
                                    recipientGroup: null,
                                    insertedAt: new Date().toString(),
                                    updatedAt: new Date().toString(),
                                },
                            },
                        };
                    },
                },
            ];
            const screen = render(
                <ComposeMessage
                    threadRepresentation={{
                        messageType: ChatType.DirectMessage,
                        counterpart: SomeUserin,
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
                                    senderUser: SomeUser,
                                    recipientUser: SomeUserin,
                                    recipientGroup: null,
                                    insertedAt: new Date().toString(),
                                    updatedAt: new Date().toString(),
                                },
                            },
                        };
                    },
                },
            ];
            const screen = render(
                <ComposeMessage
                    threadRepresentation={{
                        messageType: ChatType.DirectMessage,
                        counterpart: SomeUserin,
                    }}
                />,
                {},
                { currentUser: SomeUser, additionalMocks }
            );
            userEvent.type(screen.getByRole('textbox'), 'Hallo!{enter}');
            await waitFor(() => {
                expect(didCallMutation).toEqual(true);
            });
        });

        it('should not send form on ENTER when SHIFT modifier is pressed', async () => {
            const screen = render(
                <ComposeMessage
                    threadRepresentation={{
                        messageType: ChatType.DirectMessage,
                        counterpart: SomeUserin,
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
