import { gql } from '@apollo/client';

export const UpdatePasswordMutation = gql`
    mutation UpdatePassword($newPassword: String!) {
        updatePassword(newPassword: $newPassword) {
            id
        }
    }
`;
