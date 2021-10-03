import * as React from 'react';
import { render } from 'test/util';
import { SomeUser } from 'test/fixtures';
import Messaging from '../pages/messaging';

describe('pages/messaging', () => {
    it('should show the page with title when user is logged in', async () => {
        const onPushLocation = jest.fn();
        const screen = render(
            <Messaging />,
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
