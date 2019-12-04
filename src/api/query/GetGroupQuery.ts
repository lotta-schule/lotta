import gql from 'graphql-tag';

export const GetGroupQuery = gql`
    query GetGroup($id: ID!) {
        group(id: $id) {
            id
            name
            sortKey
            enrollmentTokens {
                id
                token
            }
        }
    }
`;