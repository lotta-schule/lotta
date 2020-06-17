import { gql } from '@apollo/client';

export const UpdatePasswordMutation = gql`
    mutation UpdatePassword($currentPassword: String!, $newPassword: String!) {
        updatePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
            id
        }
    }
`;
