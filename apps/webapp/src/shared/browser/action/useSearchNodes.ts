import * as React from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  GetDirectoriesAndFilesQueryResult,
  makeBrowserNodes,
} from '../makeBrowserNodes';

import SearchDirectoriesAndFilesQuery from 'api/query/SearchDirectoriesAndFiles.graphql';

export const useSearchNodes = () => {
  const [runSearch] = useLazyQuery<GetDirectoriesAndFilesQueryResult>(
    SearchDirectoriesAndFilesQuery
  );

  return React.useCallback(
    (searchterm: string) =>
      runSearch({ variables: { searchterm } }).then(
        ({ data }) => makeBrowserNodes(data) ?? []
      ),
    [runSearch]
  );
};
