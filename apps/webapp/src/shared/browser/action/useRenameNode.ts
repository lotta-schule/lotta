import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { BrowserProps } from '@lotta-schule/hubert';

import UpdateDirectoryMutation from 'api/mutation/UpdateDirectoryMutation.graphql';
import UpdateFileMutation from 'api/mutation/UpdateFileMutation.graphql';

export const useRenameNode = () => {
  const [updateFile] = useMutation(UpdateFileMutation);
  const [updateDirectory] = useMutation(UpdateDirectoryMutation);

  return React.useCallback<Required<BrowserProps>['renameNode']>(
    async (node, newFilename) => {
      if (node.type === 'file') {
        await updateFile({ variables: { id: node.id, filename: newFilename } });
      } else {
        await updateDirectory({
          variables: { id: node.id, name: newFilename },
        });
      }
    },
    [updateDirectory, updateFile]
  );
};
