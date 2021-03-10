import { gql } from '@apollo/client';

export const UpdateUserMutation = gql`
    mutation UpdateUser($id: ID!, $groups: [SelectUserGroupInput]) {
        user: UpdateUser(id: $id, groups: $groups) {
            id
            groups {
                id
            }
            assignedGroups {
                id
            }
        }
    }
`;
