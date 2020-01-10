import gql from 'graphql-tag';

export const SendFormResponseMutation = gql`
    mutation SendFormResponseMutation($id: ID!, $response: Json!) {
        sendFormResponse(contentModuleId: $id, response: $response)
    }
`;