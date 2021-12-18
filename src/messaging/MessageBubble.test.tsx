import * as React from 'react';
import { render, waitFor } from 'test/util';
import { SomeUser, SomeUserin, createConversation } from 'test/fixtures';
import { MessageBubble } from './MessageBubble';
import userEvent from '@testing-library/user-event';

import DeleteMessageMutation from 'api/mutation/DeleteMessageMutation.graphql';

const message = {
    ...createConversation(SomeUser, { user: SomeUserin }).messages[0],
    content: 'Hallo!',
};

describe('messaging/MessageBubble', () => {
    it('should render the shared', () => {
        render(<MessageBubble message={message} />);
    });

    it('should render show the message and sender name', () => {
        const screen = render(<MessageBubble message={message} />);
        expect(screen.getByText('Hallo!')).toBeVisible();
        expect(screen.getByText('Che (Ernesto Guevara)')).toBeVisible();
    });

    describe('delete button', () => {
        it('should show delete button for own messages', async () => {
            const screen = render(
                <MessageBubble message={message} />,
                {},
                { currentUser: SomeUser }
            );
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /löschen/ })
                ).toBeVisible();
            });
        });

        it("should not show delete button for other people's messages", () => {
            const screen = render(
                <MessageBubble message={message} />,
                {},
                { currentUser: SomeUserin }
            );
            expect(
                screen.queryByRole('button', { name: /löschen/ })
            ).toBeNull();
        });
    });

    it('should send a message delete request', async () => {
        const resultFn = jest.fn(() => ({ data: { message: message } }));
        const screen = render(
            <MessageBubble message={message} />,
            {},
            {
                currentUser: SomeUser,
                additionalMocks: [
                    {
                        request: {
                            query: DeleteMessageMutation,
                            variables: { id: message.id },
                        },
                        result: resultFn,
                    },
                ],
            }
        );
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /löschen/ })
            ).not.toBeNull();
        });
        userEvent.click(screen.getByRole('button', { name: /löschen/ }));
        await waitFor(() => {
            expect(resultFn).toHaveBeenCalled();
        });
    });
});
