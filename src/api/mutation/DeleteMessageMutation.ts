import { gql } from '@apollo/client';

export const DeleteMessageMutation = gql`
    mutation DeleteMessage($id: ID!) {
        message: deleteMessage(id: $id) {
            id
        }
    }
`;
