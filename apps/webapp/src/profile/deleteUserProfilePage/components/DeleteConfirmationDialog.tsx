import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
} from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client/react';
import { PERMANENTLY_DELETE_USER_ACCOUNT } from '../queries';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { redirectTo } from 'util/browserLocation';

import styles from '../DeleteUserProfilePage.module.scss';

export interface DeleteConfirmationDialogProps {
  open: boolean;
  selectedFilesToTransfer: Array<{ id: string }>;
  onClose: () => void;
}

export const DeleteConfirmationDialog = ({
  open,
  selectedFilesToTransfer,
  onClose,
}: DeleteConfirmationDialogProps) => {
  const currentUser = useCurrentUser();
  const [destroyAccount, { loading: isLoading, error }] = useMutation(
    PERMANENTLY_DELETE_USER_ACCOUNT
  );
  return (
    <Dialog
      open={open}
      onRequestClose={onClose}
      title={'Benutzerkonto wirklich löschen?'}
    >
      <DialogContent>
        <ErrorMessage error={error} />
        <p>
          Das Benutzerkonto wird endgültig und unwiederbringlich gelöscht. Daten
          können nicht wiederhergestellt werden.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          Abbrechen
        </Button>
        <Button
          onClick={async () => {
            try {
              await destroyAccount({
                variables: {
                  userId: currentUser!.id,
                  transferFileIds:
                    selectedFilesToTransfer?.map((file) => file.id) || [],
                },
              });
              alert('Dein Benutzerkonto wurde gelöscht.');
              redirectTo('/auth/logout');
            } catch (e) {
              console.error('Error deleting user account:', e);
            }
          }}
          icon={<Icon icon={faTrashCan} size={'lg'} />}
          className={styles.deleteButton}
          disabled={isLoading}
        >
          Jetzt alle Daten endgültig löschen
        </Button>
      </DialogActions>
    </Dialog>
  );
};
DeleteConfirmationDialog.displayName = 'DeleteConfirmationDialog';
