import * as React from 'react';
import { useMutation } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  Input,
  Label,
} from '@lotta-schule/hubert';
import { RequestHisecTokenDialog } from './RequestHisecTokenDialog';

import UpdatePasswordMutation from 'api/mutation/UpdatePasswordMutation.graphql';

export interface UpdatePasswordDialogProps {
  isOpen: boolean;
  isFirstPasswordChange?: boolean;
  withCurrentPassword?: string;
  onRequestClose(): void;
}

export const UpdatePasswordDialog = React.memo(
  ({
    isOpen,
    onRequestClose,
    isFirstPasswordChange,
    withCurrentPassword,
  }: UpdatePasswordDialogProps) => {
    const [showRequestHisecToken, setShowRequestHisecToken] =
      React.useState(false);
    const [newPassword, setNewPassword] = React.useState('');
    const [newPasswordRepetition, setNewPasswordRepetition] =
      React.useState('');
    const resetForm = () => {
      setNewPassword('');
      setNewPasswordRepetition('');
    };
    const [updatePassword, { loading: isLoading, error }] = useMutation<
      { updatePassword: boolean },
      { newPassword: string }
    >(UpdatePasswordMutation, {
      variables: { newPassword },
      onCompleted: () => {
        resetForm();
        onRequestClose();
      },
    });

    return (
      <>
        <Dialog
          open={isOpen}
          aria-hidden={!isOpen || showRequestHisecToken}
          title={'Passwort ändern'}
          onRequestClose={onRequestClose}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowRequestHisecToken(true);
            }}
            data-testid="UpdatePasswordDialog"
          >
            <DialogContent>
              {!isFirstPasswordChange && (
                <>Wähle ein neues Passwort und bestätige es.</>
              )}
              {isFirstPasswordChange && (
                <>
                  Du meldest dich zum ersten Mal. Wähle ein sicheres Passwort
                  dass du in Zukunft nutzen kannst.
                </>
              )}
              <ErrorMessage error={error} />
              <Label label={'Neues Passwort:'}>
                <Input
                  autoFocus={isOpen}
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.currentTarget.value)}
                  disabled={isLoading}
                  placeholder={'Neues Passwort'}
                  type="password"
                  autoComplete={'new-password'}
                />
              </Label>
              <Label label={'Wiederholung Neues Passwort:'}>
                <Input
                  type="password"
                  id="new-password-repetition"
                  value={newPasswordRepetition}
                  onChange={(e) =>
                    setNewPasswordRepetition(e.currentTarget.value)
                  }
                  disabled={isLoading}
                  placeholder={'Neues Passwort'}
                  autoComplete={'new-password'}
                />
              </Label>
            </DialogContent>
            <DialogActions>
              {!isFirstPasswordChange && (
                <Button
                  onClick={() => {
                    resetForm();
                    onRequestClose();
                  }}
                >
                  Abbrechen
                </Button>
              )}
              <Button
                type={'submit'}
                disabled={
                  !newPassword ||
                  newPassword !== newPasswordRepetition ||
                  isLoading
                }
              >
                Passwort ändern
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <RequestHisecTokenDialog
          isOpen={showRequestHisecToken}
          withCurrentPassword={withCurrentPassword}
          onRequestClose={(authToken) => {
            setShowRequestHisecToken(false);
            if (authToken) {
              updatePassword({
                context: { authToken },
              });
            }
          }}
        />
      </>
    );
  }
);
UpdatePasswordDialog.displayName = 'UpdatePasswordDialog';
