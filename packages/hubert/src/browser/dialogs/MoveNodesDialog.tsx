import * as React from 'react';
import { CreateNewDirectoryDialog } from './CreateNewDirectoryDialog';
import { Dialog, DialogActions, DialogContent } from '../../dialog';
import { BrowserPath, useBrowserState } from '../BrowserStateContext';
import { ErrorMessage } from '../../message';
import { Tooltip } from '../../util';
import { Button, LoadingButton } from '../../button';
import { CreateNewFolder } from '../../icon';
import { DirectorySelector } from './DirectorySelector';
import { isDirectoryNode, isFileNode } from '../utils';

export const MoveNodesDialog = React.memo(() => {
  const { currentAction, resetAction, moveNode, onRequestChildNodes, canEdit } =
    useBrowserState();

  const [targetPath, setTargetPath] = React.useState<BrowserPath<'directory'>>(
    (currentAction?.type === 'move-nodes' &&
      currentAction?.paths.at(0)?.filter(isDirectoryNode).slice(0, -1)) ||
      []
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isCreateNewFolderDialogOpen, setIsCreateNewFolderDialogOpen] =
    React.useState(false);

  const nodesToMove = React.useMemo(() => {
    return (
      (currentAction?.type === 'move-nodes' &&
        currentAction?.paths?.map((p) => p.at(-1)!)) ||
      []
    );
  }, [currentAction]);

  React.useEffect(() => {
    if (!currentAction?.type) {
      setTargetPath([]);
      setErrorMessage(null);
    } else if (currentAction?.type === 'move-nodes') {
      setTargetPath(
        currentAction?.paths.at(0)?.slice(0, -1).filter(isDirectoryNode) ?? []
      );
    }
  }, [currentAction?.type]);

  const nodeFilter = React.useCallback(
    (nodePath: BrowserPath<'directory'>) =>
      canEdit(nodePath) &&
      currentAction?.type === 'move-nodes' &&
      currentAction.paths.every(
        (path) =>
          isFileNode(path.at(-1)) ||
          path.every((p) => p.id !== nodePath.at(-1)?.id)
      ),
    [currentAction, canEdit]
  );

  const nodeToMove = React.useMemo(
    () => (nodesToMove.length === 1 ? nodesToMove[0] : null),
    [nodesToMove]
  );

  const description = React.useMemo(
    () =>
      nodeToMove
        ? isDirectoryNode(nodeToMove)
          ? 'Ordner verschieben'
          : 'Datei verschieben'
        : nodesToMove.every(isDirectoryNode)
          ? 'Ordner verschieben'
          : nodesToMove.every(isFileNode)
            ? `${nodesToMove.length} Dateien verschieben`
            : `${nodesToMove.length} Dateien und Ordner verschieben`,
    [nodeToMove, nodesToMove]
  );

  return (
    <Dialog
      open={currentAction?.type === 'move-nodes'}
      onRequestClose={resetAction}
      title={description}
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
          filter={nodeFilter}
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
              await Promise.all(
                nodesToMove.map((n) => moveNode!(n, targetPath.at(-1) ?? null))
              );
              setTimeout(resetAction, 1000);
            } catch (e: any) {
              setErrorMessage(e?.message ?? String(e));
            }
          }}
        >
          {description}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});
MoveNodesDialog.displayName = 'MoveDirectoryDialog';
