import * as React from 'react';
import { render } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { MessagingPage } from './MessagingPage';

describe('pages/messaging', () => {
    it('should show the page with title when user is logged in', async () => {
        const screen = render(
            <MessagingPage />,
            {},
            {
                currentUser: SomeUser,
            }
        );
        expect(screen.getByTestId('title')).toBeVisible();
    });
});
