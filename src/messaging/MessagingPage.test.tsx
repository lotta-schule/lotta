import * as React from 'react';
import { render } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { MessagingPage } from './MessagingPage';

describe('pages/messaging', () => {
    it('should show the page with title when userAvatar is logged in', async () => {
        const onPushLocation = jest.fn();
        const screen = render(
            <MessagingPage />,
            {},
            {
                currentUser: SomeUser,
                router: { onPush: onPushLocation },
            }
        );
        expect(onPushLocation).not.toHaveBeenCalled();
        expect(screen.getByTestId('title')).toBeVisible();
    });
});
