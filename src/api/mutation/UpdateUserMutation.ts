import { gql } from '@apollo/client';

export const UpdateUserMutation = gql`
    mutation UpdateUser($id: ID!, $isBlocked: Boolean, $groups: [SelectUserGroupInput]) {
        user: UpdateUser(id: $id, isBlocked: $isBlocked, groups: $groups) {
            id
            isBlocked
            groups {
                id
            }
            assignedGroups {
                id
            }
        }
    }
`;
