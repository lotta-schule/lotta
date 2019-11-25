import gql from 'graphql-tag';

export const RequestPasswordResetMutation = gql`
    mutation RequestPasswordReset($email: String!) {
        requestPasswordReset(email: $email)
    }
`;