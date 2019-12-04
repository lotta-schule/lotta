import gql from 'graphql-tag';

export const ResetPasswordMutation = gql`
    mutation ResetPassword($email: String!, $password: String!, $token: String!) {
        resetPassword(email: $email, password: $password, token: $token) {
            token
        }
    }
`;