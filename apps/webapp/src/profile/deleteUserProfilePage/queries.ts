import { graphql, ResultOf } from 'api/graphql';

export const GET_RELEVANT_FILES_IN_USAGE = graphql(`
  query GetRelevantFilesInUsage {
    files: relevantFilesInUsage {
      id
      insertedAt
      updatedAt
      filename
      filesize
      mimeType
      fileType
      userId
      formats {
        name
        url
        type
        availability {
          status
        }
      }
      usage {
        ... on FileCategoryUsageLocation {
          usage
          category {
            id
            title
          }
        }
        ... on FileArticleUsageLocation {
          usage
          article {
            id
            title
            previewImageFile {
              id
            }
          }
        }
      }
      parentDirectory {
        id
        name
      }
    }
  }
`);

export const GET_OWN_ARTICLES = graphql(`
  query GetOwnArticles {
    articles: ownArticles {
      id
      insertedAt
      updatedAt
      title
      preview
      tags
      readyToPublish
      published
      previewImageFile {
        id
      }
      category {
        id
        title
      }
      groups {
        id
        sortKey
        name
      }
      users {
        id
        nickname
        name
      }
    }
  }
`);

export const PERMANENTLY_DELETE_USER_ACCOUNT = graphql(`
  mutation DestroyAccount($userId: ID!, $transferFileIds: [ID!]) {
    user: destroyAccount(userId: $userId, transferFileIds: $transferFileIds) {
      id
    }
  }
`);

export type RelevantFilesInUsage = NonNullable<
  ResultOf<typeof GET_RELEVANT_FILES_IN_USAGE>['files']
>;
