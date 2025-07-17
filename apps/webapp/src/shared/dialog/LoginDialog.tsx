import * as React from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  Label,
  Input,
  LoadingButton,
} from '@lotta-schule/hubert';
import { UpdatePasswordDialog } from './UpdatePasswordDialog';
import Link from 'next/link';
import { GET_CURRENT_USER } from 'util/user/useCurrentUser';

import LoginMutation from 'api/mutation/LoginMutation.graphql';

import styles from './LoginDialog.module.scss';

export interface LoginDialogProps {
  isOpen: boolean;
  onRequestClose(): void;
}

export const LoginDialog = React.memo<LoginDialogProps>(
  ({ isOpen, onRequestClose }) => {
    const apolloClient = useApolloClient();
    const [isShowUpdatePasswordDialog, setIsShowUpdatePasswordDialog] =
      React.useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    React.useEffect(() => {
      if (isOpen === false) {
        setEmail('');
        setPassword('');
      }
    }, [isOpen]);

    const [login, { error, loading: isLoading }] = useMutation(LoginMutation, {
      errorPolicy: 'all',
      onCompleted: async (data) => {
        // TODO: Proper handling when no data is returned
        if (data.login) {
          localStorage.setItem('id', data.login.accessToken);
          await apolloClient.reFetchObservableQueries();
          const { data: userData } = await apolloClient.query({
            query: GET_CURRENT_USER,
          });
          if (userData?.currentUser?.hasChangedDefaultPassword === false) {
            setIsShowUpdatePasswordDialog(true);
          } else {
            setTimeout(() => {
              onRequestClose();
            }, 1000);
          }
        }
      },
    });

    return (
      <>
        <Dialog
          open={isOpen}
          aria-hidden={!isOpen || isShowUpdatePasswordDialog}
          className={styles.root}
          title={'Auf der Website anmelden'}
          onRequestClose={onRequestClose}
        >
          <form>
            <DialogContent>
              Melde dich hier mit deinen Zugangsdaten an.
              <ErrorMessage error={error} />
              <Label label={'Deine Email-Adresse:'}>
                <Input
                  autoFocus
                  id={'email'}
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  disabled={isLoading}
                  placeholder={'beispiel@medienportal.org'}
                  type={'email'}
                  autoComplete={'email'}
                />
              </Label>
              <Label label={'Dein Passwort:'}>
                <Input
                  type={'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  disabled={isLoading}
                  placeholder={'Passwort'}
                  autoComplete={'current-password'}
                />
              </Label>
              <Link href={`/password/request-reset`}>Passwort vergessen?</Link>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  onRequestClose();
                }}
                disabled={isLoading}
              >
                Abbrechen
              </Button>
              <LoadingButton
                type={'submit'}
                onAction={async (e: SubmitEvent | React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await login({
                    variables: { username: email, password },
                  }).then((res) => {
                    if (res.errors?.length) {
                      throw res.errors[0];
                    }
                    return res;
                  });
                }}
              >
                Anmelden
              </LoadingButton>
            </DialogActions>
          </form>
        </Dialog>
        <UpdatePasswordDialog
          isFirstPasswordChange
          withCurrentPassword={password}
          isOpen={isShowUpdatePasswordDialog}
          onRequestClose={() => {
            setIsShowUpdatePasswordDialog(false);
            onRequestClose();
          }}
        />
      </>
    );
  }
);
LoginDialog.displayName = 'LoginDialog';
