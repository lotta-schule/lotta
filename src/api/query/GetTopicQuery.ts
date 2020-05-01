import { gql } from '@apollo/client';

export const GetTopicQuery = gql`
    query GetPage($topic: String!) {
        articles: topic(topic: $topic) {
            id
            insertedAt
            updatedAt
            title
            preview
            topic
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