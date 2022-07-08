import * as React from 'react';
import {
    createConversation,
    elternGroup,
    KeinErSieEsUser,
    SomeUser,
    SomeUserin,
} from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { MessagingView } from './MessagingView';

import userEvent from '@testing-library/user-event';

import styles from './ConversationPreview.module.scss';

import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';
import SearchUsersQuery from 'api/query/SearchUsersQuery.graphql';
import SendMessageMutation from 'api/mutation/SendMessageMutation.graphql';

describe('src/messaging/MessagingView', () => {
    const conversations = [
        createConversation(SomeUser, { user: SomeUserin }),
        createConversation(SomeUser, { group: elternGroup }),
    ];
    const additionalMocks = [
        {
            request: { query: GetConversationsQuery },
            result: { data: { conversations } },
        },
    ];
    it('should list all your conversations', async () => {
        const screen = render(
            <MessagingView />,
            {},
            {
                currentUser: SomeUser,
                additionalMocks,
            }
        );

        await waitFor(() => {
            expect(
                screen.getAllByRole('button', {
                    name: /unterhaltung mit/i,
                })
            ).toHaveLength(2);
        });

        expect(
            screen.getByRole('button', { name: /Unterhaltung mit Lui/i })
        ).toBeVisible();
        expect(
            screen.getByRole('button', { name: /Unterhaltung mit Eltern/i })
        ).toBeVisible();
    });

    it('should select a conversation', async () => {
        const screen = render(
            <MessagingView />,
            {},
            {
                currentUser: SomeUser,
                additionalMocks,
            }
        );

        userEvent.click(
            await screen.findByRole('button', { name: /Unterhaltung mit Lui/i })
        );

        expect(screen.getByTestId('MessagesThread')).toBeVisible();
    });

    describe('create new message', () => {
        it('should select an available conversation when chosing the user', async () => {
            const searchUsersMock = [
                {
                    request: {
                        query: SearchUsersQuery,
                        variables: { searchtext: 'Lui' },
                    },
                    result: { data: { users: [SomeUserin] } },
                },
            ];

            const screen = render(
                <MessagingView />,
                {},
                {
                    currentUser: SomeUser,
                    additionalMocks: [...additionalMocks, ...searchUsersMock],
                }
            );

            userEvent.click(
                await screen.findByRole('button', { name: /neue nachricht/i })
            );

            userEvent.type(
                screen.getByRole('textbox', { name: /nutzer suchen/i }),
                'Lui'
            );
            userEvent.click(
                await screen.findByRole('option', { name: /Lui/i })
            );

            expect(screen.getByTestId('MessagesThread')).toBeVisible();

            const conversationButtons = await screen.findAllByRole('button', {
                name: /unterhaltung mit/i,
            });
            expect(conversationButtons).toHaveLength(2);
            expect(
                screen.getByRole('button', { name: /Unterhaltung mit Lui/ })
            ).toHaveClass(styles.selected);
        });

        it('should show the new message view when selecting a new user', async () => {
            let didCallMsgMutation = false;
            const searchUsersMock = [
                {
                    request: {
                        query: SearchUsersQuery,
                        variables: { searchtext: 'Michel' },
                    },
                    result: { data: { users: [KeinErSieEsUser] } },
                },
            ];
            const createMsgMock = [
                {
                    request: {
                        query: SendMessageMutation,
                        variables: {
                            message: {
                                content: 'Hallo!',
                                recipientUser: { id: KeinErSieEsUser.id },
                                recipientGroup: undefined,
                            },
                        },
                    },
                    result: () => {
                        return {
                            data: {
                                message: {
                                    id: 99901551,
                                    content: 'Hallo!',
                                    user: SomeUser,
                                    insertedAt: new Date().toString(),
                                    updatedAt: new Date().toString(),
                                    conversation: {
                                        id: 99901,
                                        insertedAt: new Date().toString(),
                                        updatedAt: new Date().toString(),
                                        users: [SomeUser, KeinErSieEsUser],
                                        groups: [],
                                        messages: [{ id: 99901551 }],
                                    },
                                },
                            },
                        };
                    },
                },
            ];

            const screen = render(
                <MessagingView />,
                {},
                {
                    currentUser: SomeUser,
                    additionalMocks: [
                        ...additionalMocks,
                        ...searchUsersMock,
                        ...createMsgMock,
                    ],
                }
            );

            userEvent.click(
                await screen.findByRole('button', { name: /neue nachricht/i })
            );

            userEvent.type(
                screen.getByRole('textbox', { name: /nutzer suchen/i }),
                'Michel'
            );
            userEvent.click(
                await screen.findByRole('option', { name: /Michel/i })
            );

            expect(screen.queryByTestId('MessagesThread')).toBeNull();

            const conversationButtons = await screen.findAllByRole('button', {
                name: /unterhaltung mit/i,
            });
            expect(conversationButtons).toHaveLength(2);

            expect(
                screen.getByText(/schreibe deine erste nachricht an/i)
            ).toBeVisible();

            expect(screen.getByText('Mich')).toBeVisible();
        });
    });
});
