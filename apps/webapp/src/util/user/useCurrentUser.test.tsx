import * as React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { UserModel } from 'model';
import { useCurrentUser, GET_CURRENT_USER } from './useCurrentUser';
import { SomeUser } from 'test/fixtures';
import pick from 'lodash/pick';

describe('util/userAvatar/useCurrentUser', () => {
  const createWrapperForUser = (currentUser: UserModel | null = null) => {
    const WrapperComponent = ({ children }: { children: any }) => (
      <MockedProvider
        mocks={[
          {
            request: { query: GET_CURRENT_USER },
            result: { data: { currentUser } },
          },
        ]}
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
      expect(screen.result.current).toEqual(
        pick(SomeUser, [
          'id',
          'insertedAt',
          'updatedAt',
          'lastSeen',
          'name',
          'nickname',
          'email',
          'class',
          'hideFullName',
          'enrollmentTokens',
          'unreadMessages',
          'hasChangedDefaultPassword',
          'avatarImageFile',
          'groups',
        ])
      );
    });
  });
});
