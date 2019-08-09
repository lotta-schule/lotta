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
            previewImageFile {
                id
                remoteLocation
                mimeType
                fileType
            }
            category {
                id
                title
            }
        }
    }
`;