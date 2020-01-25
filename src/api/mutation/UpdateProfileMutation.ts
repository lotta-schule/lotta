import gql from 'graphql-tag';

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
                remoteLocation
            }
            groups {
                id
                name
                sortKey
                isAdminGroup
                tenant {
                    id
                }
            }
        }
    }
`;