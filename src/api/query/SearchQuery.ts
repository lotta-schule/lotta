import { gql } from '@apollo/client';

export const SearchQuery = gql`
    query SearchQuery($searchText: String!, $options: SearchOptions) {
        results: search(searchText: $searchText, options: $options) {
            id
            insertedAt
            updatedAt
            title
            preview
            tags
            readyToPublish
            isPinnedToTop
            previewImageFile {
                id
            }
            category {
                id
                hideArticlesFromHomepage
            }
            groups {
                id
            }
            users {
                id
                nickname
                name
                avatarImageFile {
                    id
                }
            }
        }
    }
`;
