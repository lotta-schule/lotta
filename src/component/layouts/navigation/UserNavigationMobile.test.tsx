import React from 'react';
import {
    render,
    cleanup,

} from 'test/util';
import { UserNavigationMobile } from './UserNavigationMobile';
import { MockedProvider } from '@apollo/client/testing';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';

afterEach(cleanup);

describe('component/layouts/UserNavigationMobile', () => {

    describe('logged out user', () => {
        it('should render a login and logout button', async done => {
            const { container } = render(
                <MockedProvider mocks={[{ request: { query: GetCurrentUserQuery, variables: {} }, result: null }]}>
                    <UserNavigationMobile />
                </MockedProvider>
            );
            await new Promise(resolve => setTimeout(resolve));
            const buttons = container.querySelectorAll('button');
            expect(buttons.length).toEqual(3);
            done();
        });
    });

});