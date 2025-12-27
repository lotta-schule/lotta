import * as React from 'react';
import { ApolloCache } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { BrowserProps } from '@lotta-schule/hubert';
import { DirectoryModel, FileModel } from 'model';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import CreateDirectoryMutation from 'api/mutation/CreateDirectoryMutation.graphql';

const updateCache = (
  client: ApolloCache<any>,
  parentDirectoryId: string | null,
  directory: DirectoryModel
) => {
  const cached = client.readQuery<{
    directories: DirectoryModel[];
    files: FileModel[];
  }>({
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
    directory: DirectoryModel;
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
