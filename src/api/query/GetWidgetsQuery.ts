import gql from 'graphql-tag';

export const GetWidgetsQuery = gql`
    query widgets {
        widgets {
            id
            title
            type
            group {
                id
                priority
                name
            }
            configuration
        }
    }
`;