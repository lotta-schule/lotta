import gql from 'graphql-tag';

export const GetDirectoryParent = gql`
    query GetDirectoryParent($id: ID!) {
        directory(id: $id) {
            id
            name
            parentDirectory {
                id
                name
            }
        }
    }
`;