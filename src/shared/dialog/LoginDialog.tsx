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
} from '@lotta-schule/hubert';
import { UserModel } from 'model';
import { UpdatePasswordDialog } from './UpdatePasswordDialog';
import Link from 'next/link';

import LoginMutation from 'api/mutation/LoginMutation.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';

import styles from './LoginDialog.module.scss';

export interface LoginDialogProps {
    isOpen: boolean;
    onRequestClose(): void;
}

export const LoginDialog = React.memo<LoginDialogProps>(
    ({ isOpen, onRequestClose }) => {
        const apolloClient = useApolloClient();
        const [login, { error, loading: isLoading }] = useMutation(
            LoginMutation,
            {
                errorPolicy: 'all',
                onCompleted: async (data) => {
                    if (data.login) {
                        localStorage.setItem('id', data.login.accessToken);
                        await apolloClient.resetStore();
                        const { data: userData } = await apolloClient.query<{
                            currentUser: UserModel;
                        }>({ query: GetCurrentUserQuery });
                        if (
                            userData?.currentUser?.hasChangedDefaultPassword ===
                            false
                        ) {
                            setIsShowUpdatePasswordDialog(true);
                        } else {
                            onRequestClose();
                        }
                    }
                },
            }
        );

        const [isShowUpdatePasswordDialog, setIsShowUpdatePasswordDialog] =
            React.useState(false);
        const [email, setEmail] = React.useState('');
        const [password, setPassword] = React.useState('');
        const resetForm = () => {
            setEmail('');
            setPassword('');
        };

        return (
            <>
                <Dialog
                    open={isOpen}
                    className={styles.root}
                    title={'Auf der Website anmelden'}
                    onRequestClose={onRequestClose}
                >
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            login({ variables: { username: email, password } });
                        }}
                    >
                        <DialogContent>
                            Melde dich hier mit deinen Zugangsdaten an.
                            <ErrorMessage error={error} />
                            <Label label={'Deine Email-Adresse:'}>
                                <Input
                                    autoFocus
                                    id={'email'}
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.currentTarget.value)
                                    }
                                    disabled={isLoading}
                                    placeholder={'beispiel@medienportal.org'}
                                    type={'email'}
                                />
                            </Label>
                            <Label label={'Dein Passwort:'}>
                                <Input
                                    type={'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.currentTarget.value)
                                    }
                                    disabled={isLoading}
                                    placeholder={'Passwort'}
                                />
                            </Label>
                            <Link href={`/password/request-reset`}>
                                Passwort vergessen?
                            </Link>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    resetForm();
                                    onRequestClose();
                                }}
                            >
                                Abbrechen
                            </Button>
                            <Button type={'submit'}>Anmelden</Button>
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
