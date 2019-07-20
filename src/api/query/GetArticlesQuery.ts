import gql from 'graphql-tag';

export const GetArticlesQuery = gql`
    query GetArticles($categoryId: ID) {
        articles(categoryId: $categoryId) {
            id
            insertedAt
            updatedAt
            title
            preview
            pageName
            previewImageFile {
                id
                remoteLocation
                mimeType
                fileType
            }
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
            user {
                id
                nickname
            }
        }
    }
`;