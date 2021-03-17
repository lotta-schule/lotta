import { gql } from '@apollo/client';

export const RequestHisecTokenMutation = gql`
    mutation RequestHisecToken($password: String!) {
        token: requestHisecToken(password: $password)
    }
`;
