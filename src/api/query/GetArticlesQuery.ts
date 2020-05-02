import { gql } from '@apollo/client';

export const GetArticlesQuery = gql`
    query GetArticles($categoryId: ID, $filter: ArticleFilter) {
        articles(categoryId: $categoryId, filter: $filter) {
            id
            insertedAt
            updatedAt
            title
            preview
            topic
            readyToPublish
            isPinnedToTop
            previewImageFile {
                id
                remoteLocation
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
                    remoteLocation
                }
            }
        }
    }
`;