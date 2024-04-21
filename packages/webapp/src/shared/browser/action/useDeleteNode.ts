import * as React from 'react';
import { useMutation, ApolloCache } from '@apollo/client';
import { BrowserNode, BrowserProps } from '@lotta-schule/hubert';
import { DirectoryModel, FileModel } from 'model';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import DeleteDirectoryMutation from 'api/mutation/DeleteDirectoryMutation.graphql';
import DeleteFileMutation from 'api/mutation/DeleteFileMutation.graphql';

const updateCache = (
  client: ApolloCache<any>,
  node:
    | (BrowserNode<DirectoryModel> & { type: 'directory' })
    | (BrowserNode<FileModel> & { type: 'file' })
) => {
  const cache = client.readQuery<{
    files: DirectoryModel[];
    directories: DirectoryModel[];
  }>({
    query: GetDirectoriesAndFilesQuery,
    variables: {
      parentDirectoryId: node.parent,
    },
  });
  client.writeQuery({
    query: GetDirectoriesAndFilesQuery,
    variables: {
      parentDirectoryId: node.parent,
    },
    data: {
      files: (cache?.files ?? []).filter(
        (f) => node.type !== 'file' || f.id !== node.id
      ),
      directories: (cache?.directories ?? []).filter(
        (d) => node.type !== 'directory' || d.id !== node.id
      ),
    },
  });
};

export const useDeleteNode = () => {
  const [deleteDirectory] = useMutation<
    {
      directory: DirectoryModel;
    },
    { id: string }
  >(DeleteDirectoryMutation);
  const [deleteFile] = useMutation<
    {
      file: FileModel;
    },
    { id: string }
  >(DeleteFileMutation);

  return React.useCallback<Required<BrowserProps>['deleteNode']>(
    async (node) => {
      if (node.type === 'directory') {
        await deleteDirectory({
          variables: { id: node.id },
          update: (client, { data, errors }) => {
            if (data && !errors) {
              updateCache(client, node);
            }
          },
        });
      } else {
        await deleteFile({
          variables: { id: node.id },
          update: (client, { data, errors }) => {
            if (data && !errors) {
              updateCache(client, node);
            }
          },
        });
      }
    },
    [deleteDirectory, deleteFile]
  );
};
