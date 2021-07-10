import { gql } from '@apollo/client';

export const ReceiveMessageSubscription = gql`
    subscription ReceiveMessage {
        message: receiveMessage {
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
