import { useQuery } from '@apollo/client/react';
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

  return data?.currentUser ?? null;
};
