import * as React from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { makeDirectoryPaths } from '../makeBrowserNodes';
import { DirectoryModel, FileModel } from 'model';

import SearchDirectoriesAndFilesQuery from 'api/query/SearchDirectoriesAndFiles.graphql';

export const useSearchNodes = () => {
  const [runSearch] = useLazyQuery<{
    directories: (DirectoryModel & { path: DirectoryModel[] })[];
    files: (FileModel & { path: DirectoryModel[] })[];
  }>(SearchDirectoriesAndFilesQuery);

  return React.useCallback(
    (searchterm: string) =>
      runSearch({ variables: { searchterm } }).then(
        ({ data }) => makeDirectoryPaths(data) ?? []
      ),
    [runSearch]
  );
};
