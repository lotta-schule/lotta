import { gql } from '@apollo/client';

export const GetWidgetsQuery = gql`
    query widgets {
        widgets {
            id
            title
            type
            configuration
            iconImageFile {
                id
            }
            groups {
                id
                sortKey
                name
            }
        }
    }
`;
