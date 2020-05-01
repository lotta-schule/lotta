import { gql } from '@apollo/client';

export const GetTopicsQuery = gql`
    query GetTopics {
        topics
    }
`;