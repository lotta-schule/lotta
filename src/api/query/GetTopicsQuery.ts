import gql from 'graphql-tag';

export const GetTopicsQuery = gql`
    query GetTopics {
        topics
    }
`;