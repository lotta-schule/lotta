import { gql } from '@apollo/client';

export const GetArticlesForTag = gql`
    query GetArticlesForTag($tag: String!) {
        articles: tag(tag: $tag) {
            id
            insertedAt
            updatedAt
            title
            preview
            tags
            readyToPublish
            isPinnedToTop
            previewImageFile {
                id
                remoteLocation
                mimeType
                fileType
                filename
                filesize
            }
            groups {
                id
                sortKey
                name
            }
            category {
                id
                title
            }
        }
    }
`;
