import * as React from 'react';
import { Button, LoadingButton } from '../../button';
import { Dialog, DialogActions, DialogContent } from '../../dialog';
import { isDirectoryNode, isFileNode } from '../utils';
import { ErrorMessage } from '../../message';
import { LinearProgress } from '../../progress';
import { List, ListItem } from '../../list';
import { BrowserNode, useBrowserState } from '../BrowserStateContext';

import styles from './DeleteDirectoryDialog.module.scss';

export const DeleteDirectoryDialog = React.memo(() => {
  const [filesToDelete, setFilesToDelete] = React.useState<
    { file: BrowserNode; relativePath: string }[]
  >([]);
  const [directoriesToDelete, setDirectoriesToDelete] = React.useState<
    BrowserNode[]
  >([]);
  const [isLoadingChildNodes, setIsLoadingChildNodes] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const { onRequestChildNodes, currentAction, resetAction, deleteNode } =
    useBrowserState();

  const isOpen = currentAction?.type === 'delete-directory';

  const currentNode = (isOpen && currentAction?.path?.at(-1)) || null;

  if (currentNode && !isDirectoryNode(currentNode)) {
    console.error('currentNode is not a directory:', currentNode);
    throw new Error('currentNode is not a directory');
  }

  const getDirectoriesAndFilesForDirectory = React.useCallback(
    async (
      directory: BrowserNode<'directory'>,
      relativePath = ''
    ): Promise<void> => {
      setIsLoadingChildNodes(true);
      try {
        setDirectoriesToDelete((directoriesToDelete) => [
          directory,
          ...directoriesToDelete,
        ]);

        const childNodes = await onRequestChildNodes(directory, {
          refetch: true,
        });

        const [files, directories] = childNodes.reduce(
          ([files, directories], node) => {
            if (isFileNode(node)) {
              files.push(node);
              return [files, directories];
            } else if (isDirectoryNode(node)) {
              directories.push(node);
              return [files, directories];
            } else {
              return [files, directories];
            }
          },
          [[], []] as [BrowserNode<'file'>[], BrowserNode<'directory'>[]]
        );

        setFilesToDelete((filesToDelete) => [
          ...filesToDelete,
          ...files.map((f) => ({
            file: f,
            relativePath: relativePath + f.name,
          })),
        ]);
        return await Promise.all(
          directories.map((d) =>
            getDirectoriesAndFilesForDirectory(d, relativePath + d.name + '/')
          )
        ).then(void 0);
      } catch (e: any) {
        setErrorMessage(e?.message ?? String(e));
      } finally {
        setIsLoadingChildNodes(false);
      }
    },
    [onRequestChildNodes]
  );

  React.useEffect(() => {
    if (!isOpen) {
      setFilesToDelete([]);
      setDirectoriesToDelete([]);
    } else if (currentNode) {
      setFilesToDelete([]);
      setDirectoriesToDelete([]);
      getDirectoriesAndFilesForDirectory(currentNode);
    }
  }, [isOpen, currentNode]);

  return (
    <Dialog
      open={isOpen}
      onRequestClose={() => resetAction()}
      title={'Ordner löschen'}
      className={styles.root}
    >
      {currentNode && (
        <>
          <DialogContent>
            <p>
              Möchtest du den Ordner <strong>{currentNode.name}</strong>{' '}
              wirklich mit all seinen Inhalten löschen?
            </p>
            <ErrorMessage error={errorMessage} />
            {isLoadingChildNodes && (
              <LinearProgress
                isIndeterminate
                aria-label="Inhalte werden geladen"
              />
            )}
            {!isLoadingChildNodes && !filesToDelete.length && (
              <p>Dieser Ordner ist leer.</p>
            )}
            {!isLoadingChildNodes && filesToDelete.length > 0 && (
              <p>
                Der Ordner enthält <strong>{filesToDelete.length}</strong>{' '}
                Dateien, die ebenfalls gelöscht werden:
              </p>
            )}
            {!isLoadingChildNodes && filesToDelete.length > 0 && (
              <List
                title={'Ordner, die gelöscht werden sollen'}
                className={styles.filesList}
              >
                {filesToDelete.map((f) => (
                  <ListItem key={f.file.id}>{f.relativePath}</ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => resetAction()}>Abbrechen</Button>
            <LoadingButton
              disabled={isLoadingChildNodes}
              onAction={async () => {
                try {
                  for (const { file } of filesToDelete) {
                    await deleteNode?.(file).then(() =>
                      setFilesToDelete((filesToDelete) =>
                        filesToDelete.filter((f) => f.file.id !== file.id)
                      )
                    );
                  }
                  for (const directory of directoriesToDelete) {
                    await deleteNode?.(directory).then(() => {
                      return setDirectoriesToDelete((directories) =>
                        directories.filter((d) => d.id !== directory.id)
                      );
                    });
                  }
                  setTimeout(() => {
                    resetAction();
                  }, 1000);
                } catch (e: any) {
                  setErrorMessage(e?.message ?? String(e));
                }
              }}
            >
              Ordner endgültig löschen
            </LoadingButton>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
});
DeleteDirectoryDialog.displayName = 'DeleteDirectoryDialog';
