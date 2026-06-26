import { graphql } from '#/api/graphql';
import {
  BrowserDirectoryFragment,
  BrowserFileFragment,
} from './GetDirectoriesAndFiles';

export const SearchDirectoriesAndFilesQuery = graphql(
  `
    query SearchDirectoriesAndFiles($searchterm: String!) {
      directories: searchDirectories(searchterm: $searchterm) {
        ...BrowserDirectory
        path {
          ...BrowserDirectory
        }
      }
      files: searchFiles(searchterm: $searchterm) {
        ...BrowserFile
        path {
          ...BrowserDirectory
        }
      }
    }
  `,
  [BrowserDirectoryFragment, BrowserFileFragment]
);
