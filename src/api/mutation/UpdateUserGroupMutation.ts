import gql from 'graphql-tag';

export const UpdateUserGroupMutation = gql`
    mutation UpdateUserGroup($id: ID!, $group: UserGroupInput) {
        group: updateUserGroup(id: $id, group: $group) {
            id
            name
            isAdminGroup
            sortKey
            enrollmentTokens {
                token
            }
        }
    }
`;