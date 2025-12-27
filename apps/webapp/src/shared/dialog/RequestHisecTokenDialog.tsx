import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  Input,
  Label,
} from '@lotta-schule/hubert';

import RequestHisecTokenMutation from 'api/mutation/RequestHisecTokenMutation.graphql';

export interface RequestHisecTokenDialogProps {
  isOpen: boolean;
  withCurrentPassword?: string;
  onRequestClose(token: string | null): void;
}

export const RequestHisecTokenDialog = React.memo<RequestHisecTokenDialogProps>(
  ({ isOpen, onRequestClose, withCurrentPassword }) => {
    const [password, setPassword] = React.useState('');
    const [requestHisecToken, { loading: isLoading, error }] = useMutation<
      { token: string },
      { password: string }
    >(RequestHisecTokenMutation, {
      variables: { password },
      onCompleted: ({ token }) => {
        onRequestClose(token);
      },
    });
    React.useEffect(() => {
      setPassword('');
    }, [isOpen]);
    React.useEffect(() => {
      if (isOpen && withCurrentPassword) {
        requestHisecToken({
          variables: { password: withCurrentPassword },
        });
      }
    }, [withCurrentPassword, requestHisecToken, isOpen]);

    return (
      <Dialog
        open={isOpen && !withCurrentPassword}
        onRequestClose={() => onRequestClose(null)}
        title={'Durch Passwort bestätigen'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestHisecToken({
              variables: { password },
            });
          }}
          data-testid="RequestHisecTokenDialog"
        >
          <DialogContent>
            Bitte bestätige die Änderung mit deinem aktuellen Passwort.
            <ErrorMessage error={error} />
            <Label label={'Passwort:'}>
              <Input
                id="current-password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                disabled={isLoading}
                placeholder={'Passwort'}
                type="password"
                autoComplete={'current-password'}
              />
            </Label>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                onRequestClose(null);
              }}
            >
              Abbrechen
            </Button>
            <Button type={'submit'} disabled={!password || isLoading}>
              senden
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
RequestHisecTokenDialog.displayName = 'RequestHisecTokenDialog';
