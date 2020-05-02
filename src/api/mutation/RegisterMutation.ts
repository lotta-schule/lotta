import { gql } from '@apollo/client';

export const RegisterMutation = gql`
    mutation Register($user: RegisterUserParams!, $groupKey: String) {
        register(user: $user, groupKey: $groupKey) {
            token
        }
    }
`;