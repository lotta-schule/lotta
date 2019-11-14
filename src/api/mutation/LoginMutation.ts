import gql from 'graphql-tag';

export const LoginMutation = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            token,
            user {
                id
                insertedAt
                updatedAt
                lastSeen
                name
                nickname
                email
                class
                avatarImageFile {
                    remoteLocation
                }
                groups {
                    id
                    name
                    sortKey
                    isAdminGroup
                    tenant {
                        id
                    }
                }
            }
        }
    }
`;