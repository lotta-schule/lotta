import * as React from 'react';
import { ApolloCache } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { BrowserProps } from '@lotta-schule/hubert';

import { GetDirectoriesAndFilesQuery } from '../_graphql/GetDirectoriesAndFiles';
import { BrowserDirectoryData, BrowserFileData } from '../makeBrowserNodes';
import UpdateDirectoryMutation from '#/api/mutation/UpdateDirectoryMutation.graphql';
import UpdateFileMutation from '#/api/mutation/UpdateFileMutation.graphql';

const updateCache = <T extends BrowserFileData | BrowserDirectoryData>(
  client: ApolloCache,
  initialModel: T,
  updateResult: T extends BrowserFileData
    ? { file: BrowserFileData }
    : { directory: BrowserDirectoryData }
) => {
  const currentParentId = initialModel.parentDirectory?.id ?? null;

  client.updateQuery(
    {
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: currentParentId },
      overwrite: true,
    },
    (data) =>
      data && {
        files:
          'file' in updateResult
            ? data.files.filter((f) => f.id !== initialModel.id)
            : data.files,
        directories:
          'directory' in updateResult
            ? data.directories.filter((d) => d.id !== initialModel.id)
            : data.directories,
      }
  );

  const newParentId =
    ('directory' in updateResult
      ? updateResult.directory.parentDirectory?.id
      : 'file' in updateResult
        ? updateResult.file.parentDirectory?.id
        : null) ?? null;

  client.updateQuery(
    {
      query: GetDirectoriesAndFilesQuery,
      variables: { parentDirectoryId: newParentId },
    },
    (data) => {
      if (!data) return null;

      return {
        files:
          'file' in updateResult
            ? [
                ...data.files,
                { ...(initialModel as BrowserFileData), ...updateResult.file },
              ]
            : data.files,
        directories:
          'directory' in updateResult
            ? [
                ...data.directories,
                {
                  ...(initialModel as BrowserDirectoryData),
                  ...updateResult.directory,
                },
              ]
            : data.directories,
      };
    }
  );
};

export const useMoveNode = () => {
  const [moveDirectory] = useMutation<{ directory: BrowserDirectoryData }>(
    UpdateDirectoryMutation
  );
  const [moveFile] = useMutation<{ file: BrowserFileData }>(UpdateFileMutation);

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
