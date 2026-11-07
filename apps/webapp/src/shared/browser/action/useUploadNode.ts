import * as React from 'react';
import { ApolloCache } from '@apollo/client';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { BrowserNode, BrowserProps } from '@lotta-schule/hubert';
import { graphql, ResultOf } from '#/api/graphql';

import { GetDirectoriesAndFilesQuery } from '../_graphql/GetDirectoriesAndFiles';
import { refreshDirectoryListings } from '../refreshDirectoryListings';

export const UPLOAD_FILE_MUTATION = graphql(`
  mutation UploadFile($file: Upload!, $parentDirectoryId: ID!) {
    file: uploadFile(file: $file, parentDirectoryId: $parentDirectoryId) {
      id
      insertedAt
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
  client: ApolloCache,
  parentNode: BrowserNode<'directory'>,
  file: NonNullable<ResultOf<typeof UPLOAD_FILE_MUTATION>['file']>
) => {
  // readQuery uses parentDirectoryId only (no filter) — the cache field policy's
  // keyArgs: ['parentDirectoryId'] maps this to the same merged entry as the
  // paginated reads, so `cache` contains the full accumulated file list.
  const cache = client.readQuery({
    query: GetDirectoriesAndFilesQuery,
    variables: { parentDirectoryId: parentNode.id },
  });
  client.writeQuery({
    query: GetDirectoriesAndFilesQuery,
    variables: { parentDirectoryId: parentNode.id },
    data: {
      // the list may already contain the file: it was loaded after the upload
      // was saved (e.g. when the directory was just opened)
      files: cache?.files.some((f) => f.id === file.id)
        ? cache.files
        : [...(cache?.files ?? []), file],
      directories: [...(cache?.directories ?? [])],
    },
  });
};

export const useUploadNode = () => {
  const apolloClient = useApolloClient();
  const [uploadFile] = useMutation(UPLOAD_FILE_MUTATION);

  return React.useCallback<Required<BrowserProps>['uploadNode']>(
    (upload, parent, update) => {
      void uploadFile({
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
          void refreshDirectoryListings(apolloClient);
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
    [uploadFile, apolloClient]
  );
};
