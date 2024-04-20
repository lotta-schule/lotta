import * as React from 'react';
import { useBrowserState } from './BrowserStateContext';
import {
  CreateNewDirectoryDialog,
  DeleteDirectoryDialog,
  MoveDirectoryDialog,
} from './dialogs';

export const BrowserDialogs = React.memo(() => {
  const { currentAction, setCurrentAction } = useBrowserState();

  const resetAction = React.useCallback(() => setCurrentAction(null), []);

  return (
    <>
      <CreateNewDirectoryDialog
        onRequestClose={resetAction}
        parentNode={
          (currentAction?.type === 'create-directory' &&
            currentAction?.path?.slice(-1)?.[0]) ||
          null
        }
        isOpen={currentAction?.type === 'create-directory'}
      />
      <DeleteDirectoryDialog />
      <MoveDirectoryDialog />
    </>
  );
});
BrowserDialogs.displayName = 'BrowserDialogs';
