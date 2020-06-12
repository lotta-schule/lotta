import React from 'react';
import { render, cleanup, waitFor } from 'test/util';
import { SomeUser, adminGroup } from 'test/fixtures';
import AdminLayout from './AdminLayout';

afterEach(cleanup);

describe('component/layouts/adminLayout/AdminLayout', () => {

    it('should redirect user to homepage when not logged in', async done => {
        const onChangeLocation = jest.fn((location: Location) => {
            expect(location.pathname).toEqual('/');
        });
        render(
            <AdminLayout />,
            {}, { defaultPathEntries: ['/admin/tenant/general'], onChangeLocation }
        );
        await waitFor(() => {
            expect(onChangeLocation).toHaveBeenCalled();
        });
        done();
    });

    it('should redirect user to homepage when not admin', async done => {
        const onChangeLocation = jest.fn((location: Location) => {
            expect(location.pathname).toEqual('/');
        });
        render(
            <AdminLayout />,
            {}, { currentUser: SomeUser, defaultPathEntries: ['/admin/tenant/general'], onChangeLocation }
        );
        await waitFor(() => {
            expect(onChangeLocation).toHaveBeenCalled();
        });
        done();
    });

    it('should show the page with title to user if he is admin', async done => {
        const onChangeLocation = jest.fn();
        const { findByTestId } = render(
            <AdminLayout />,
            {}, {
                currentUser: { ...SomeUser, groups: [adminGroup] },
                defaultPathEntries: ['/admin/tenant/general'],
                onChangeLocation
            }
        );
        await findByTestId('title');
        expect(onChangeLocation).not.toHaveBeenCalled();
        done();
    });

});
