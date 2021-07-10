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
                    id
                }
            }
            recipientUser {
                id
                name
                nickname
                avatarImageFile {
                    id
                }
            }
            recipientGroup {
                id
                name
            }
        }
    }
`;
