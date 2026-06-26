import * as React from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { makeDirectoryPaths } from '../makeBrowserNodes';
import { SearchDirectoriesAndFilesQuery } from '../_graphql/SearchDirectoriesAndFiles';

export const useSearchNodes = () => {
  const [runSearch] = useLazyQuery(SearchDirectoriesAndFilesQuery);

  return React.useCallback(
    (searchterm: string) =>
      runSearch({ variables: { searchterm } }).then(
        ({ data }) => makeDirectoryPaths(data) ?? []
      ),
    [runSearch]
  );
};
