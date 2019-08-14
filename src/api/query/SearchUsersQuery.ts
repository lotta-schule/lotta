import gql from 'graphql-tag';

export const SearchUsersQuery = gql`
    query SearchUsers($searchtext: String!) {
        users: searchUsers(searchtext: $searchtext) {
            id
            insertedAt
            updatedAt
            name
            class
            nickname
            email
        }
    }
`;