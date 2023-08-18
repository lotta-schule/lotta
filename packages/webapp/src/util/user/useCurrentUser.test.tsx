import * as React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { UserModel } from 'model';
import { useCurrentUser } from './useCurrentUser';
import { SomeUser } from 'test/fixtures';

import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';

describe('util/userAvatar/useCurrentUser', () => {
  const createWrapperForUser = (currentUser: UserModel | null = null) => {
    const WrapperComponent = ({ children }: { children: any }) => (
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
    WrapperComponent.displayName = 'WrapperComponent';
    return WrapperComponent;
  };

  it('should return null if the userAvatar is not logged in', async () => {
    const screen = renderHook(() => useCurrentUser(), {
      wrapper: createWrapperForUser(null),
    });
    await waitFor(() => {
      expect(screen.result.current).toBeNull();
    });
  });

  it('should return the userAvatar if the userAvatar is logged in', async () => {
    const screen = renderHook(() => useCurrentUser(), {
      wrapper: createWrapperForUser({ ...SomeUser }),
    });
    await waitFor(() => {
      expect(screen.result.current).toEqual(SomeUser);
    });
  });
});
