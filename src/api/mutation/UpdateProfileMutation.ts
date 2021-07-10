import { gql } from '@apollo/client';

export const UpdateProfileMutation = gql`
    mutation UpdateProfile($user: UpdateUserParams!) {
        user: updateProfile(user: $user) {
            id
            insertedAt
            updatedAt
            name
            nickname
            email
            class
            enrollmentTokens
            avatarImageFile {
                id
            }
            groups {
                id
                name
                sortKey
                isAdminGroup
            }
        }
    }
`;
