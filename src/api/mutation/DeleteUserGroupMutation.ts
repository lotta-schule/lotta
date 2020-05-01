import { gql } from '@apollo/client';

export const DeleteUserGroupMutation = gql`
    mutation DeleteUserGroup($id: ID!) {
        group: deleteUserGroup(id: $id) {
            id
        }
    }
`;