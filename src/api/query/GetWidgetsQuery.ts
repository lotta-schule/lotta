import gql from 'graphql-tag';

export const GetWidgetsQuery = gql`
    query widgets {
        widgets {
            id
            title
            type
            configuration
            iconImageFile {
                    id
                    remoteLocation
                }
            groups {
                id
                sortKey
                name
            }
        }
    }
`;