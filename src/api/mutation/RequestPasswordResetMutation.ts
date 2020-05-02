import { gql } from '@apollo/client';

export const RequestPasswordResetMutation = gql`
    mutation RequestPasswordReset($email: String!) {
        requestPasswordReset(email: $email)
    }
`;