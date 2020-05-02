import { gql } from '@apollo/client';

export const GetContentModuleResults = gql`
    query GetContentModuleResults($contentModuleId: ID!) {
        contentModuleResults: contentModuleResults(contentModuleId: $contentModuleId) {
            id
            insertedAt
            updatedAt
            result
        }
    }
`;