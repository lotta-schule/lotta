import gql from 'graphql-tag';

export const UpdateArticleMutation = gql`
    mutation UpdateArticle($id: ID!, $article: ArticleInput) {
        article: updateArticle(id: $id, article: $article) {
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
                configuration
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