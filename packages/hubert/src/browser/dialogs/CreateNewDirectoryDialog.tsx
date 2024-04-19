import * as React from 'react';
import { Button, LoadingButton } from 'button';
import { Dialog, DialogActions, DialogContent } from 'dialog';
import { ErrorMessage } from 'message';
import { Label } from 'label';
import { Input } from 'form';
import { BrowserNode, useBrowserState } from '../BrowserStateContext';

export interface CreateNewFolderDialogProps {
  parentNode: BrowserNode | null;
  isOpen: boolean;
  onRequestClose(): void;
}

export const CreateNewDirectoryDialog = React.memo(
  ({ parentNode, isOpen, onRequestClose }: CreateNewFolderDialogProps) => {
    const [name, setName] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const { onCreateDirectory } = useBrowserState();

    React.useEffect(() => {
      if (!isOpen) {
        setName('');
        setErrorMessage(null);
      }
    }, [isOpen]);

    return (
      <Dialog
        open={isOpen}
        onRequestClose={onRequestClose}
        title={'Neuen Ordner erstellen'}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onCreateDirectory?.(parentNode, name);
          }}
        >
          <DialogContent>
            <p>Wähle einen Namen für den Ordner, den du erstellen möchtest.</p>
            <ErrorMessage error={errorMessage} />
            <Label label={'Name des Ordners'}>
              <Input
                autoFocus
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setName(event.currentTarget.value)
                }
              />
            </Label>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => onRequestClose()}>Abbrechen</Button>
            <LoadingButton
              type={'submit'}
              onComplete={() => {
                setTimeout(() => onRequestClose(), 1000);
              }}
            >
              Ordner erstellen
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
CreateNewDirectoryDialog.displayName = 'CreateNewDirectoryDialog';
