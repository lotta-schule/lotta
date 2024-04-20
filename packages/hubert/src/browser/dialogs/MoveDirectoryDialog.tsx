import * as React from 'react';
import { DirectorySelector } from './directorySelector/DirectorySelector';
import { CreateNewDirectoryDialog } from './CreateNewDirectoryDialog';
import { Dialog, DialogActions, DialogContent } from '../../dialog';
import { BrowserNode, useBrowserState } from '../BrowserStateContext';
import { ErrorMessage } from '../../message';
import { Tooltip } from '../../util';
import { Button, LoadingButton } from '../../button';
import { CreateNewFolder } from '../../icon';

export const MoveDirectoryDialog = React.memo(() => {
  const [targetNode, setTargetNode] = React.useState<BrowserNode | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isCreateNewFolderDialogOpen, setIsCreateNewFolderDialogOpen] =
    React.useState(false);

  const { currentAction, resetAction, moveNode } = useBrowserState();

  const nodeToMove = currentAction?.path?.at(-1);

  return (
    <Dialog
      open={currentAction?.type === 'move-node'}
      onRequestClose={resetAction}
      title={
        nodeToMove?.type === 'directory'
          ? 'Ordner verschieben'
          : 'Datei verschieben'
      }
    >
      <DialogContent>
        Wähle ein Zielort
        <ErrorMessage error={errorMessage} />
        <Tooltip label={'Ordner erstellen'}>
          <Button
            aria-label="Ordner erstellen"
            onClick={() => setIsCreateNewFolderDialogOpen(true)}
            icon={<CreateNewFolder />}
          />
        </Tooltip>
        <DirectorySelector onSelect={setTargetNode} />
        <CreateNewDirectoryDialog
          parentNode={targetNode}
          isOpen={isCreateNewFolderDialogOpen}
          onRequestClose={() => setIsCreateNewFolderDialogOpen(false)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAction}>Abbrechen</Button>
        <LoadingButton
          disabled={targetNode?.id === nodeToMove?.id}
          onAction={async () => {
            try {
              await moveNode?.(nodeToMove!, targetNode);
              setTimeout(resetAction, 1000);
            } catch (e: any) {
              setErrorMessage(e?.message ?? String(e));
            }
          }}
        >
          Ordner verschieben
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});
MoveDirectoryDialog.displayName = 'MoveDirectoryDialog';
