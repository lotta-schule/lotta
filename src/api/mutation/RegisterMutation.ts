import gql from 'graphql-tag';

export const RegisterMutation = gql`
    mutation Register($user: RegisterUserParams!, $groupKey: String) {
        register(user: $user, groupKey: $groupKey) {
            token
        }
    }
`;