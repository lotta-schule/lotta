import * as React from 'react';
import { ApolloCache } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { BrowserNode, BrowserProps } from '@lotta-schule/hubert';

import DeleteDirectoryMutation from '#/api/mutation/DeleteDirectoryMutation.graphql';
import DeleteFileMutation from '#/api/mutation/DeleteFileMutation.graphql';

const updateCache = (client: ApolloCache, node: BrowserNode) => {
  const normalizedId = client.identify(node.meta as any);
  if (normalizedId) {
    client.evict({ id: normalizedId });
    // gc() clears the dangling ref left in the paginated files array by the
    // cache field policy merge function (see Decision 4 in the feature plan).
    client.gc();
  }
};

export const useDeleteNode = () => {
  const [deleteDirectory] = useMutation(DeleteDirectoryMutation);
  const [deleteFile] = useMutation(DeleteFileMutation);

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
