import gql from 'graphql-tag';

export const AssignUserToGroupMutation = gql`
    mutation AssignUserToGroup($id: ID!, $groupId: ID!) {
        user: AssignUserToGroup(id: $id, groupId: $groupId) {
            id
            name
            nickname
            email
            class
            groups {
                id
                name
                priority
                isAdminGroup
                tenant {
                    id
                }
            }
        }
    }
`;