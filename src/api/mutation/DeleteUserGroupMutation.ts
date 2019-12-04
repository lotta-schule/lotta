import gql from 'graphql-tag';

export const DeleteUserGroupMutation = gql`
    mutation DeleteUserGroup($id: ID!) {
        group: deleteUserGroup(id: $id) {
            id
        }
    }
`;