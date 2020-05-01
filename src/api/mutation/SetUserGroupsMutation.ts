import { gql } from '@apollo/client';

export const SetUserGroupsMutation = gql`
    mutation SetUserGroups($id: ID!, $groupIds: [ID!]!) {
        user: SetUserGroups(id: $id, groupIds: $groupIds) {
            id
            name
            nickname
            email
            class
            groups {
                id
                name
                sortKey
                isAdminGroup
                tenant {
                    id
                }
            }
        }
    }
`;