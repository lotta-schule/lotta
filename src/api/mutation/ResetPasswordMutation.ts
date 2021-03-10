import { gql } from '@apollo/client';

export const ResetPasswordMutation = gql`
    mutation ResetPassword(
        $email: String!
        $password: String!
        $token: String!
    ) {
        resetPassword(email: $email, password: $password, token: $token) {
            accessToken
        }
    }
`;
