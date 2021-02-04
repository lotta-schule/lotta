import { gql } from '@apollo/client';

export const SendMessageMutation = gql`
    mutation SendMessages($message: MessageInput) {
        message: createMessage(message: $message) {
            id
            insertedAt
            updatedAt
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
