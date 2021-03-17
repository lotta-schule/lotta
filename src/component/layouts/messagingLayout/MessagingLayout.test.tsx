import React from 'react';
import { render, waitFor } from 'test/util';
import { SomeUser } from 'test/fixtures';
import MessagingLayout from './MessagingLayout';

describe('component/layouts/adminLayout/MessagingLayout', () => {
    it('should redirect user to homepage when not logged in', async () => {
        const onChangeLocation = jest.fn(({ location }) => {
            expect(location.pathname).toEqual('/');
        });
        render(
            <MessagingLayout />,
            {},
            {
                defaultPathEntries: ['/messaging'],
                onChangeLocation,
                useCache: true,
            }
        );
        await waitFor(() => {
            expect(onChangeLocation).toHaveBeenCalled();
        });
    });

    it('should show the page with title when user is logged in', async () => {
        const onChangeLocation = jest.fn();
        const screen = render(
            <MessagingLayout />,
            {},
            {
                currentUser: SomeUser,
                defaultPathEntries: ['/messaging'],
                useCache: true,
                onChangeLocation,
            }
        );
        expect(onChangeLocation).not.toHaveBeenCalled();
        expect(screen.getByTestId('title')).toBeVisible();
    });
});
