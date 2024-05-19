import * as React from 'react';
import { useMutation, ApolloCache } from '@apollo/client';
import { BrowserNode, BrowserProps } from '@lotta-schule/hubert';
import { DirectoryModel, FileModel } from 'model';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import UploadFileMutation from 'api/mutation/UploadFileMutation.graphql';

const updateCache = (
  client: ApolloCache<any>,
  parentNode: BrowserNode<'directory'>,
  file: FileModel
) => {
  const cache = client.readQuery<{
    files: FileModel[];
    directories: DirectoryModel[];
  }>({
    query: GetDirectoriesAndFilesQuery,
    variables: {
      parentDirectoryId: parentNode.id,
    },
  });
  client.writeQuery({
    query: GetDirectoriesAndFilesQuery,
    variables: {
      parentDirectoryId: parentNode.id,
    },
    data: {
      files: [...(cache?.files ?? []), file],
      directories: [...(cache?.directories ?? [])],
    },
  });
};

export const useUploadNode = () => {
  const [uploadFile] = useMutation<{
    file: FileModel;
  }>(UploadFileMutation);

  return React.useCallback<Required<BrowserProps>['uploadNode']>(
    (upload, parent, update) => {
      uploadFile({
        variables: {
          parentDirectoryId: parent.id,
          file: upload.file,
        },
        context: {
          fetchOptions: {
            onUploadProgress: (progress: ProgressEvent) => {
              const uploadProgress = (progress.loaded / progress.total) * 100;
              update(() => ({
                progress: uploadProgress,
                transferSpeed: upload.transferSpeed,
                transferedBytes: upload.transferedBytes,
              }));
            },
          },
        },
        onCompleted: () => {
          update(() => ({
            status: 'done',
            endTime: new Date(),
            progress: 100,
          }));
        },
        onError: (error) => {
          update(() => ({ status: 'error', error }));
        },
        update: (client, { data }) => {
          if (data?.file) {
            updateCache(client, parent, data.file);
          }
        },
      });
    },
    [uploadFile]
  );
};
