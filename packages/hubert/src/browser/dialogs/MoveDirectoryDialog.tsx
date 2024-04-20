import * as React from 'react';
import { CreateNewDirectoryDialog } from './CreateNewDirectoryDialog';
import { Dialog, DialogActions, DialogContent } from '../../dialog';
import { BrowserPath, useBrowserState } from '../BrowserStateContext';
import { ErrorMessage } from '../../message';
import { Tooltip } from '../../util';
import { Button, LoadingButton } from '../../button';
import { CreateNewFolder } from '../../icon';
import { DirectorySelector } from './DirectorySelector';

export const MoveDirectoryDialog = React.memo(() => {
  const { currentAction, resetAction, moveNode, onRequestChildNodes, canEdit } =
    useBrowserState();

  const [targetPath, setTargetPath] = React.useState<BrowserPath>(
    currentAction?.path.slice(0, currentAction.path.length - 1) ?? []
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isCreateNewFolderDialogOpen, setIsCreateNewFolderDialogOpen] =
    React.useState(false);

  const nodeToMove = currentAction?.path?.at(-1);

  React.useEffect(() => {
    if (!currentAction?.type) {
      setTargetPath([]);
      setErrorMessage(null);
    } else if (currentAction?.type === 'move-node') {
      setTargetPath(
        currentAction?.path.slice(0, currentAction.path.length - 1) ?? []
      );
    }
  }, [currentAction?.type]);

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
        <DirectorySelector
          value={targetPath}
          onChange={setTargetPath}
          getNodesForParent={onRequestChildNodes}
          filter={(n) =>
            canEdit(n) && currentAction!.path.every((p) => p.id !== n.id)
          }
        />
        <CreateNewDirectoryDialog
          parentNode={targetPath.at(-1) ?? null}
          isOpen={isCreateNewFolderDialogOpen}
          onRequestClose={() => setIsCreateNewFolderDialogOpen(false)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAction}>Abbrechen</Button>
        <LoadingButton
          disabled={targetPath?.some((n) => n?.id === nodeToMove?.id)}
          onAction={async () => {
            try {
              await moveNode?.(nodeToMove!, targetPath.at(-1) ?? null);
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
