import React from 'react';
import { render, cleanup, waitFor } from 'test/util';
import { SomeUser } from 'test/fixtures';
import ProfileLayout from './ProfileLayout';

afterEach(cleanup);

describe('component/layouts/adminLayout/ProfileLayout', () => {

    it('should redirect user to homepage when not logged in', async done => {
        const onChangeLocation = jest.fn((location: Location) => {
            expect(location.pathname).toEqual('/');
        });
        render(
            <ProfileLayout />,
            {}, { defaultPathEntries: ['/profile'], onChangeLocation }
        );
        await waitFor(() => {
            expect(onChangeLocation).toHaveBeenCalled();
        });
        done();
    });

    it('should show the page with title to user if he is admin', async done => {
        const onChangeLocation = jest.fn();
        const { findByTestId } = render(
            <ProfileLayout />,
            {}, {
                currentUser: SomeUser,
                defaultPathEntries: ['/profile'],
                onChangeLocation
            }
        );
        await findByTestId('title');
        expect(onChangeLocation).not.toHaveBeenCalled();
        done();
    });

});
