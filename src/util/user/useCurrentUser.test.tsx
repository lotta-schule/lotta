import * as React from 'react';
import { FunctionComponent } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react-hooks';
import { UserModel } from 'model';
import { useCurrentUser } from './useCurrentUser';
import { SomeUser } from 'test/fixtures';

import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';

describe('util/userAvatar/useCurrentUser', () => {
    const createWrapperForUser = (
        currentUser: UserModel | null = null
    ): FunctionComponent => {
        // eslint-disable-next-line react/display-name
        return ({ children }) => (
            <MockedProvider
                mocks={[
                    {
                        request: { query: GetCurrentUserQuery },
                        result: { data: { currentUser } },
                    },
                ]}
                addTypename={false}
            >
                <div>{children}</div>
            </MockedProvider>
        );
    };

    it('should return null if the userAvatar is not logged in', async () => {
        const screen = renderHook(() => useCurrentUser(), {
            wrapper: createWrapperForUser(null),
        });
        await screen.waitForNextUpdate();
        expect(screen.result.current).toBeNull();
    });

    it('should return the userAvatar if the userAvatar is logged in', async () => {
        const screen = renderHook(() => useCurrentUser(), {
            wrapper: createWrapperForUser({ ...SomeUser }),
        });
        await screen.waitForNextUpdate();
        expect(screen.result.current).toEqual(SomeUser);
    });
});
