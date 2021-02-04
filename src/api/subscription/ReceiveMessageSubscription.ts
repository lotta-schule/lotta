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
