import { gql } from '@apollo/client';

export const SendFormResponseMutation = gql`
    mutation SendFormResponseMutation($id: ID!, $response: Json!) {
        sendFormResponse(contentModuleId: $id, response: $response)
    }
`;
