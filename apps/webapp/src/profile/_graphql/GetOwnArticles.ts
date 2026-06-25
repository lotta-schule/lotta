import { graphql } from '#/api/graphql';

export const OWN_ARTICLES_PAGE_SIZE = 50;
export const OWN_ARTICLES_INITIAL_FILTER = { first: OWN_ARTICLES_PAGE_SIZE };

export const GET_OWN_ARTICLES_QUERY = graphql(`
  query GetOwnArticles($filter: ArticleFilter) {
    articles: ownArticles(filter: $filter) {
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
        title
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
