import { graphql, type ResultOf } from '#/api/graphql';

export const SEARCH_USERS = graphql(`
  query SearchUsersAsAdmin(
    $searchtext: String
    $groups: [SelectUserGroupInput]
    $lastSeen: Int
  ) {
    users: searchUsers(
      searchtext: $searchtext
      groups: $groups
      lastSeen: $lastSeen
    ) {
      id
      insertedAt
      updatedAt
      name
      nickname
      email
      class
      enrollmentTokens
      lastSeen
      usedStorageSize
      groups {
        id
        name
        isAdminGroup
      }
      assignedGroups {
        id
        name
      }
      avatarImageFile {
        id
        formats(category: "AVATAR") {
          name
          url
          type
          availability {
            status
          }
        }
      }
    }
  }
`);

export type SEARCH_USERS_RESULT = NonNullable<
  ResultOf<typeof SEARCH_USERS>
>['users'];
