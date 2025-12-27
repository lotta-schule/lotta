import * as React from 'react';
import { ApolloCache } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { BrowserProps } from '@lotta-schule/hubert';
import { DirectoryModel, FileModel } from 'model';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import UpdateDirectoryMutation from 'api/mutation/UpdateDirectoryMutation.graphql';
import UpdateFileMutation from 'api/mutation/UpdateFileMutation.graphql';

const updateCache = <T extends FileModel | DirectoryModel>(
  client: ApolloCache<any>,
  initialModel: T,
  updateResult: T extends FileModel
    ? { file: FileModel }
    : { directory: DirectoryModel }
) => {
  const currentParentId = initialModel.parentDirectory?.id ?? null;
  client.updateQuery<{ files: FileModel[]; directories: DirectoryModel[] }>(
    {
      query: GetDirectoriesAndFilesQuery,
      variables: {
        parentDirectoryId: currentParentId,
      },
      overwrite: true,
    },
    (data) =>
      data && {
        files:
          'file' in updateResult
            ? data.files.filter((f) => f.id !== initialModel.id)
            : (data?.files ?? []),
        directories:
          'directory' in updateResult
            ? data.directories.filter((d) => d.id !== initialModel.id)
            : (data?.directories ?? []),
      }
  );

  const newParentId =
    ('directory' in updateResult
      ? updateResult.directory.parentDirectory?.id
      : 'file' in updateResult
        ? updateResult.file.parentDirectory?.id
        : null) ?? null;

  client.updateQuery<{
    files: FileModel[];
    directories: DirectoryModel[];
  }>(
    {
      query: GetDirectoriesAndFilesQuery,
      variables: {
        parentDirectoryId: newParentId,
      },
    },
    (data) => {
      if (!data) {
        return null;
      }

      const currentFiles = data?.files ?? [];
      const currentDirectories = data?.directories ?? [];
      const updated = {
        files:
          'file' in updateResult
            ? [
                ...currentFiles,
                { ...(initialModel as FileModel), ...updateResult.file },
              ]
            : currentFiles,
        directories:
          'directory' in updateResult
            ? [
                ...currentDirectories,
                {
                  ...(initialModel as DirectoryModel),
                  ...updateResult.directory,
                },
              ]
            : currentDirectories,
      };

      return updated;
    }
  );
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
            if (data) {
              updateCache(client, node.meta, data);
            }
          },
        });
      } else {
        await moveDirectory({
          variables: { id: node.id, parentDirectoryId: newParent?.id ?? null },
          update: (client, { data }) => {
            if (data) {
              updateCache(client, node.meta, data);
            }
          },
        });
      }
    },
    [moveDirectory, moveFile]
  );
};
