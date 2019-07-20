import gql from 'graphql-tag';

export const GetPageQuery = gql`
    query GetPage($name: String!) {
        page(name: $name) {
            id
            insertedAt
            updatedAt
            title
            preview
            previewImageUrl
            pageName
            contentModules {
                id
                type
                text
                sortKey
                files {
                    id
                    remoteLocation
                    mimeType
                    fileType
                    fileConversions {
                        id
                        format
                        mimeType
                        remoteLocation
                    }
                }
            }
            category {
                id
                title
            }
        }
    }
`;