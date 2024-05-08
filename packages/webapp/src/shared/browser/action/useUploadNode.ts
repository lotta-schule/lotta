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
              upload.progress = uploadProgress;
              upload.transferSpeed =
                progress.loaded / ((Date.now() - upload.startTime) / 1000);
              upload.transferedBytes = progress.loaded;
              update(upload);
            },
          },
        },
        onCompleted: () => {
          upload.status = 'done';
          upload.endTime = new Date();
          update(upload);
        },
        onError: (error) => {
          upload.status = 'error';
          upload.error = error;
          update(upload);
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
