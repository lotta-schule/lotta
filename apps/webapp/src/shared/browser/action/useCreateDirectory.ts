import * as React from 'react';
import { ApolloCache } from '@apollo/client';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { BrowserProps } from '@lotta-schule/hubert';

import CreateDirectoryMutation from '#/api/mutation/CreateDirectoryMutation.graphql';
import {
  BrowserDirectoryData,
  GetDirectoriesAndFilesQuery,
} from '../_graphql/GetDirectoriesAndFiles';
import { refreshDirectoryListings } from '../refreshDirectoryListings';

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
      // the listing may already contain it: it was loaded after the directory was created
      directories: cached?.directories.some((d) => d.id === directory.id)
        ? cached.directories
        : [...(cached?.directories ?? []), directory],
      files: cached?.files ?? [],
    },
  });
};

export const useCreateDirectory = () => {
  const apolloClient = useApolloClient();
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
        onCompleted: () => void refreshDirectoryListings(apolloClient),
        update: (client, { data }) => {
          if (data) {
            updateCache(client, parentNode?.id ?? null, data.directory);
          }
        },
      });
    },
    [createDirectory, apolloClient]
  );
};
