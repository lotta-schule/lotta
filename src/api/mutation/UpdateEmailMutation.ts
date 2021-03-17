import { gql } from '@apollo/client';

export const UpdateEmailMutation = gql`
    mutation UpdateEmail($newEmail: String!) {
        updateEmail(newEmail: $newEmail) {
            id
            email
        }
    }
`;
