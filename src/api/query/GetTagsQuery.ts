import { gql } from '@apollo/client';

export const GetTagsQuery = gql`
    query GetTags {
        tags
    }
`;
