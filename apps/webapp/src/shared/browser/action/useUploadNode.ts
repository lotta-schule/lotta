import * as React from 'react';
import { ApolloCache } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { BrowserNode, BrowserProps } from '@lotta-schule/hubert';
import { DirectoryModel, FileModel } from 'model';
import { graphql, ResultOf } from 'api/graphql';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';

export const UPLOAD_FILE_MUTATION = graphql(`
  mutation UploadFile($file: Upload!, $parentDirectoryId: ID!) {
    file: uploadFile(file: $file, parentDirectoryId: $parentDirectoryId) {
      id
      insertedAt
      updatedAt
      filename
      filesize
      mimeType
      fileType
      userId
      metadata
      parentDirectory {
        id
      }
      formats {
        availability {
          status
          progress
          error
        }
        name
        url
        type
      }
    }
  }
`);

const updateCache = (
  client: ApolloCache<any>,
  parentNode: BrowserNode<'directory'>,
  file: NonNullable<ResultOf<typeof UPLOAD_FILE_MUTATION>['file']>
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
  const [uploadFile] = useMutation(UPLOAD_FILE_MUTATION);

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
            endTime: new Date().getTime(),
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
