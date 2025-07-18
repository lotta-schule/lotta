import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
import { useQuery } from '@apollo/client';
import { graphql, ResultOf } from 'api/graphql';

export const GET_CURRENT_USER = graphql(`
  query GetCurrentUser {
    currentUser {
      id
      insertedAt
      updatedAt
      lastSeen
      name
      nickname
      email
      class
      hideFullName
      enrollmentTokens
      unreadMessages
      hasChangedDefaultPassword
      avatarImageFile {
        id
        formats(category: "avatar") {
          name
          url
          availability {
            status
          }
        }
      }
      groups {
        id
        name
        isAdminGroup
        sortKey
      }
    }
  }
`);

export type CurrentUser = NonNullable<
  ResultOf<typeof GET_CURRENT_USER>['currentUser']
>;

export const useCurrentUser = () => {
  const { data } = useQuery(GET_CURRENT_USER);

  const currentUser = data?.currentUser ?? null;

  React.useEffect(() => {
    if (currentUser) {
      Sentry.setUser({
        id: currentUser.id,
        username: currentUser.nickname ?? currentUser.name ?? undefined,
        email: currentUser.email ?? undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [currentUser]);

  return currentUser;
};
