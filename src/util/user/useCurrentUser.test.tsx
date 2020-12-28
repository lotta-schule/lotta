import { FunctionComponent } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react-hooks';
import { UserModel } from 'model';
import { useCurrentUser } from './useCurrentUser';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { SomeUser } from 'test/fixtures';
import {omit} from 'lodash';

describe('util/user/useCurrentUser', () => {
    const createWrapperForUser = ((currentUser: UserModel | null = null): FunctionComponent => {
        return ({ children }) => (
            <MockedProvider
                mocks={[{ request: { query: GetCurrentUserQuery }, result: { data: { currentUser } }}]}
                addTypename={false}
            >
                <div>{children}</div>
            </MockedProvider>
        );
    });

    it('should return undefined if the user is loading', () => {
        const screen = renderHook(() => useCurrentUser(), { wrapper: createWrapperForUser(null) });
        expect(screen.result.current).not.toBeDefined();
    });

    it('should return null if the user is not logged in', async () => {
        const screen = renderHook(() => useCurrentUser(), { wrapper: createWrapperForUser(null) });
        await screen.waitForNextUpdate();
        expect(screen.result.current).toBeNull();
    });

    it('should return the user if the user is logged in', async () => {
        const screen = renderHook(() => useCurrentUser(), { wrapper: createWrapperForUser({ ...SomeUser }) });
        await screen.waitForNextUpdate();
        expect(screen.result.current).toEqual(omit(SomeUser, ['isBlocked']));
    });
});
