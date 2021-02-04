import React from 'react';
import { render, waitFor } from 'test/util';
import { SomeUser } from 'test/fixtures';
import ProfileLayout from './ProfileLayout';

describe('component/layouts/adminLayout/ProfileLayout', () => {

    it('should redirect user to homepage when not logged in', async () => {
        const onChangeLocation = jest.fn(({ location }) => {
            expect(location.pathname).toEqual('/');
        });
        render(
            <ProfileLayout />,
            {}, { defaultPathEntries: ['/profile'], onChangeLocation, useCache: true }
        );
        await waitFor(() => {
            expect(onChangeLocation).toHaveBeenCalled();
        });
    });

    it('should show the page with title to user if he is admin', async () => {
        const onChangeLocation = jest.fn();
        const { findByTestId } = render(
            <ProfileLayout />,
            {}, {
                currentUser: SomeUser,
                defaultPathEntries: ['/profile'],
                useCache: true,
                onChangeLocation
            }
        );
        await findByTestId('title');
        expect(onChangeLocation).not.toHaveBeenCalled();
    });

});
