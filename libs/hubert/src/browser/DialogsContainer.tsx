import * as React from 'react';
import { useBrowserState } from './BrowserStateContext';
import {
  CreateNewDirectoryDialog,
  DeleteDirectoryDialog,
  DeleteFilesDialog,
  MoveNodesDialog,
} from './dialogs';

export const DialogsContainer = React.memo(() => {
  const { currentAction, setCurrentAction } = useBrowserState();

  const resetAction = React.useCallback(
    () => setCurrentAction(null),
    [setCurrentAction]
  );

  return (
    <>
      <CreateNewDirectoryDialog
        onRequestClose={resetAction}
        parentNode={
          (currentAction?.type === 'create-directory' &&
            currentAction.path.at(-1)) ||
          null
        }
        isOpen={currentAction?.type === 'create-directory'}
      />
      <DeleteDirectoryDialog />
      <DeleteFilesDialog />
      <MoveNodesDialog />
    </>
  );
});
DialogsContainer.displayName = 'DialogsContainer';
