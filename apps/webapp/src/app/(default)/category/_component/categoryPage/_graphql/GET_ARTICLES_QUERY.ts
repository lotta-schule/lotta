import { graphql } from 'api/graphql';

export const GET_ARTICLES_QUERY = graphql(`
  query GetArticles($categoryId: ID!, $filter: ArticleFilter) {
    articles(categoryId: $categoryId, filter: $filter) {
      id
      insertedAt
      updatedAt
      title
      preview
      tags
      readyToPublish
      published
      isPinnedToTop
      previewImageFile {
        id
        formats(category: "ARTICLEPREVIEW") {
          name
          url
          type
          availability {
            status
          }
        }
      }
      category {
        id
        hideArticlesFromHomepage
      }
      users {
        id
        nickname
        name
        avatarImageFile {
          id
          formats(category: "AVATAR") {
            name
            url
            type
            availability {
              status
            }
          }
        }
      }
    }
  }
`);
