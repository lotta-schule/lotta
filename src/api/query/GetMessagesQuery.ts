import { gql } from '@apollo/client';

export const GetMessagesQuery = gql`
    query GetMessages {
        messages {
            id
            insertedAt
            updatedAt
            content
            senderUser {
                id
                name
                avatarImageFile {
                    remoteLocation
                }
            }
            recipientUser {
                id
                name
                avatarImageFile {
                    remoteLocation
                }
            }
            recipientGroup {
                id
                name
            }
        }
    }
`;
