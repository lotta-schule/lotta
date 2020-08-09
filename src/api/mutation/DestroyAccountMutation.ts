import { gql } from '@apollo/client';

export const DestroyAccountMutation = gql`
    mutation DestroyAccount($transferFileIds: [ID!]) {
        user: destroyAccount(transferFileIds: $transferFileIds) {
            id
        }
    }
`;
