import * as React from 'react';
import { Dialog, DialogActions, DialogContent } from '../../dialog';
import { ErrorMessage } from '../../message';
import { List, ListItem } from '../../list';
import { Button, LoadingButton } from '../../button';
import { BrowserNode, useBrowserState } from '../BrowserStateContext';

import styles from './DeleteFilesDialog.module.scss';

export const DeleteFilesDialog = React.memo(() => {
  const { currentAction, resetAction, deleteNode } = useBrowserState();
  const [errors, setErrors] = React.useState<Error[]>([]);

  const isOpen = currentAction?.type === 'delete-files';

  const filesToDelete = React.useMemo(() => {
    if (currentAction?.type !== 'delete-files') {
      return [];
    }
    return currentAction.paths
      .map((path) => path.at(-1))
      .filter((node) => {
        return node?.type === 'file';
      }) as BrowserNode[];
  }, [currentAction]);

  React.useEffect(() => {
    if (!isOpen) {
      setErrors([]);
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onRequestClose={resetAction}
      title={'Dateien löschen'}
      className={styles.root}
    >
      {errors.map((error, i) => (
        <ErrorMessage key={i} error={error} />
      ))}
      <DialogContent>
        Möchtest du die folgenden Dateien wirklich löschen? Sie sind dann
        unwiederbringlich verloren. Sollten Sie in Beiträgen, Modulen oder als
        Profilbild verwendet werden, wird die Referenz auch dort entfernt.
        <List title="Dateien, die gelöscht werden">
          {filesToDelete.map((file) => (
            <ListItem key={file.id}>{file.name}</ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAction}>Abbrechen</Button>
        <LoadingButton
          disabled={filesToDelete.length === 0}
          onAction={async () => {
            try {
              setErrors([]);
              const results = await Promise.allSettled(
                filesToDelete.map((fileNode) => deleteNode?.(fileNode))
              );
              setErrors(
                results
                  .filter(
                    (result): result is PromiseRejectedResult =>
                      result.status === 'rejected'
                  )
                  .map((result) => result.reason)
              );
              if (errors.length === 0) {
                setTimeout(() => {
                  resetAction();
                }, 1000);
              }
            } catch (e: any) {
              setErrors([e]);
            }
          }}
        >
          Dateien endgültig löschen
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});
DeleteFilesDialog.displayName = 'DeleteFilesDialog';
