import gql from 'graphql-tag';

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
            group {
                id
                priority
                name
            }
            category {
                id
                title
            }
        }
    }
`;