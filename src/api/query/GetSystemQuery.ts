import { gql } from '@apollo/client';

export const GetSystemQuery = gql`
    query GetSystem {
        system {
            id
            title
            slug
            host
            customTheme
            userMaxStorageConfig
            logoImageFile {
                id
                remoteLocation
            }
            backgroundImageFile {
                id
                remoteLocation
            }
            groups {
                id
                name
                sortKey
                isAdminGroup
            }
        }
    }
`;
