import { gql } from '@apollo/client';

export const GetGroupQuery = gql`
    query GetGroup($id: ID!) {
        group(id: $id) {
            id
            name
            isAdminGroup
            sortKey
            enrollmentTokens {
                id
                token
            }
        }
    }
`;