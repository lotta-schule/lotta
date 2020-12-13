import React from 'react';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';
import { render, waitFor } from 'test/util';
import { SomeUser, adminGroup } from 'test/fixtures';
import AdminLayout from './AdminLayout';

describe('component/layouts/adminLayout/AdminLayout', () => {

    it('should redirect user to homepage when not logged in', async () => {
        const onChangeLocation = jest.fn(({ location }) => {
            expect(location.pathname).toEqual('/');
        });
        render(
            <AdminLayout />,
            {}, { defaultPathEntries: ['/admin/system/general'], onChangeLocation, useCache: true }
        );
        await waitFor(() => {
            expect(onChangeLocation).toHaveBeenCalled();
        });
    });

    it('should redirect user to homepage when not admin', async () => {
        const onChangeLocation = jest.fn(({ location }) => {
            expect(location.pathname).toEqual('/');
        });
        render(
            <AdminLayout />,
            {}, { currentUser: SomeUser, defaultPathEntries: ['/admin/system/general'], onChangeLocation, useCache: true }
        );
        await waitFor(() => {
            expect(onChangeLocation).toHaveBeenCalled();
        });
    });

    it('should show the page with title to user if he is admin', async () => {
        const onChangeLocation = jest.fn();
        const screen = render(
            <AdminLayout />,
            {}, {
                currentUser: { ...SomeUser, groups: [adminGroup] },
                defaultPathEntries: ['/admin/system/general'],
                additionalMocks: [{ request: { query: GetUnpublishedArticlesQuery }, result: { data: { articles: [] } } }],
                onChangeLocation,
                useCache: true,
            }
        );
        await screen.findByTestId('title');
        expect(onChangeLocation).not.toHaveBeenCalled();
    });

});
