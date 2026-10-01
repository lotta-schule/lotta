import * as React from 'react';
import { ApolloCache } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { BrowserProps } from '@lotta-schule/hubert';

import CreateDirectoryMutation from '#/api/mutation/CreateDirectoryMutation.graphql';
import {
  BrowserDirectoryData,
  GetDirectoriesAndFilesQuery,
} from '../_graphql/GetDirectoriesAndFiles';

const updateCache = (
  client: ApolloCache,
  parentDirectoryId: string | null,
  directory: BrowserDirectoryData
) => {
  const cached = client.readQuery({
    query: GetDirectoriesAndFilesQuery,
    variables: { parentDirectoryId },
  });
  client.writeQuery({
    query: GetDirectoriesAndFilesQuery,
    variables: { parentDirectoryId },
    data: {
      directories: [...(cached?.directories ?? []), directory],
      files: cached?.files ?? [],
    },
  });
};

export const useCreateDirectory = () => {
  const [createDirectory] = useMutation<{
    directory: BrowserDirectoryData;
  }>(CreateDirectoryMutation);

  return React.useCallback<Required<BrowserProps>['createDirectory']>(
    async (parentNode, name) => {
      await createDirectory({
        variables: {
          name,
          parentDirectoryId: parentNode?.id,
          isPublic: false,
        },
        update: (client, { data }) => {
          if (data) {
            updateCache(client, parentNode?.id ?? null, data.directory);
          }
        },
      });
    },
    [createDirectory]
  );
};
