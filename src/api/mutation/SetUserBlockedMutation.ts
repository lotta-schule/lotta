import { gql } from '@apollo/client';

export const SetUserBlockedMutation = gql`
    mutation SetUserBlocked($id: ID!, $isBlocked: Boolean!) {
        user: setUserBlocked(id: $id, isBlocked: $isBlocked) {
            id
            email
            isBlocked
        }
    }
`;