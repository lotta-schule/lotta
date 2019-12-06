import gql from 'graphql-tag';

export const CreateUserGroupMutation = gql`
    mutation CreateUserGroup($group: UserGroupInput) {
        group: createUserGroup(group: $group) {
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