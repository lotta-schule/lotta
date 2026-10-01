import { FragmentOf, graphql } from '#/api/graphql';

export const FILES_PAGE_SIZE = 25;
export const FILES_INITIAL_FILTER = { first: FILES_PAGE_SIZE };

export const BrowserDirectoryFragment = graphql(`
  fragment BrowserDirectory on Directory @_unmask {
    id
    insertedAt
    name
    user {
      id
    }
    parentDirectory {
      id
    }
  }
`);

export type BrowserDirectoryData = FragmentOf<typeof BrowserDirectoryFragment>;

export const BrowserFileFragment = graphql(`
  fragment BrowserFile on File @_unmask {
    id
    insertedAt
    filename
    filesize
    metadata
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
    parentDirectory {
      id
    }
  }
`);

export const GetDirectoriesAndFilesQuery = graphql(
  `
    query GetDirectoriesAndFiles($parentDirectoryId: ID, $filter: FileFilter) {
      directories(parentDirectoryId: $parentDirectoryId) {
        ...BrowserDirectory
      }
      files(parentDirectoryId: $parentDirectoryId, filter: $filter) {
        ...BrowserFile
      }
    }
  `,
  [BrowserDirectoryFragment, BrowserFileFragment]
);
