import * as React from 'react';
import { useMutation, ApolloCache } from '@apollo/client';
import { BrowserProps } from '@lotta-schule/hubert';
import { DirectoryModel, FileModel } from 'model';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import UpdateDirectoryMutation from 'api/mutation/UpdateDirectoryMutation.graphql';
import UpdateFileMutation from 'api/mutation/UpdateFileMutation.graphql';

const updateCache = (
  client: ApolloCache<any>,
  initialModel: FileModel | DirectoryModel,
  updateResult: { directory?: DirectoryModel; file?: FileModel }
) => {
  const fromDirId = initialModel.parentDirectory?.id ?? null;
  if (!updateResult.file && !updateResult.directory) {
    return;
  }
  const cacheFrom = client.readQuery<{
    files: DirectoryModel[];
    directories: DirectoryModel[];
  }>({
    query: GetDirectoriesAndFilesQuery,
    variables: { parentDirectoryId: fromDirId },
  });

  client.writeQuery({
    query: GetDirectoriesAndFilesQuery,
    variables: { parentDirectoryId: fromDirId },
    data: {
      files: updateResult.file
        ? cacheFrom?.files?.filter((f) => f.id !== initialModel.id)
        : cacheFrom?.files ?? [],
      directories: updateResult.directory
        ? cacheFrom?.directories?.filter((d) => d.id !== initialModel.id)
        : cacheFrom?.directories ?? [],
    },
  });

  const newParentId =
    updateResult.directory?.parentDirectory?.id ??
    updateResult.file?.parentDirectory?.id ??
    null;
  const cacheTo = client.readQuery<{
    files: DirectoryModel[];
    directories: DirectoryModel[];
  }>({
    query: GetDirectoriesAndFilesQuery,
    variables: {
      parentDirectoryId:
        updateResult.directory?.parentDirectory?.id ??
        updateResult.file?.parentDirectory?.id ??
        null,
    },
  });
  client.writeQuery({
    query: GetDirectoriesAndFilesQuery,
    variables: {
      parentDirectoryId: newParentId,
    },
    data: {
      files: updateResult.file
        ? [...(cacheTo?.files ?? []), { ...initialModel, ...updateResult.file }]
        : cacheTo?.files ?? [],
      directories: updateResult.directory
        ? [
            ...(cacheTo?.directories ?? []),
            {
              initialModel,
              ...updateResult.directory,
            },
          ]
        : cacheTo?.directories ?? [],
    },
  });
};

export const useMoveNode = () => {
  const [moveDirectory] = useMutation<{
    directory: DirectoryModel;
  }>(UpdateDirectoryMutation);
  const [moveFile] = useMutation<{
    file: FileModel;
  }>(UpdateFileMutation);

  return React.useCallback<Required<BrowserProps>['moveNode']>(
    async (node, newParent) => {
      if (node.type === 'file') {
        await moveFile({
          variables: { id: node.id, parentDirectoryId: newParent?.id ?? null },
          update: (client, { data }) => {
            updateCache(client, node.meta, data ?? {});
          },
        });
      } else {
        await moveDirectory({
          variables: { id: node.id, parentDirectoryId: newParent?.id ?? null },
          update: (client, { data }) => {
            updateCache(client, node.meta, data ?? {});
          },
        });
      }
    },
    [moveDirectory, moveFile]
  );
};
