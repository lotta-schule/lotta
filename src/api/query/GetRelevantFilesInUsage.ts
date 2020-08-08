import { gql } from '@apollo/client';

export const GetRelevantFilesInUsageQuery = gql`
    query GetRelevantFilesInUsage {
        files: relevantFilesInUsage {
            id
            insertedAt
            updatedAt
            filename
            filesize
            remoteLocation
            mimeType
            fileType
            userId
            fileConversions {
                id
                insertedAt
                updatedAt
                format
                mimeType
                remoteLocation
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
                          remoteLocation
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
`;
