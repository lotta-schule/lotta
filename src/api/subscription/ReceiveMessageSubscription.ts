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
