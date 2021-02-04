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
                nickname
                avatarImageFile {
                    remoteLocation
                }
            }
            recipientUser {
                id
                name
                nickname
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
