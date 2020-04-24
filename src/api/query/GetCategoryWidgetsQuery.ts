import gql from 'graphql-tag';

export const GetCategoryWidgetsQuery = gql`
    query widgets($categoryId: ID!) {
        widgets(categoryId: $categoryId) {
            id
            title
            type
            configuration
            iconImageFile {
                id
                remoteLocation
            }
        }
    }
`;