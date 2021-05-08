import React, { FunctionComponent, memo, useState } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Link,
    makeStyles,
    Typography,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { useApolloClient, useMutation } from '@apollo/client';
import { LoginMutation } from 'api/mutation/LoginMutation';
import { CollisionLink } from 'component/general/CollisionLink';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';
import { UpdatePasswordDialog } from './UpdatePasswordDialog';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { UserModel } from 'model';

export interface LoginDialogProps {
    isOpen: boolean;
    onRequestClose(): void;
}

const useStyles = makeStyles((theme) => ({
    root: {
        '& a': {
            display: 'block',
            marginTop: theme.spacing(1),
            float: 'right',
        },
    },
}));

export const LoginDialog: FunctionComponent<LoginDialogProps> = memo(
    ({ isOpen, onRequestClose }) => {
        const styles = useStyles();
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

        const [
            isShowUpdatePasswordDialog,
            setIsShowUpdatePasswordDialog,
        ] = useState(false);
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const resetForm = () => {
            setEmail('');
            setPassword('');
        };

        return (
            <>
                <ResponsiveFullScreenDialog
                    open={isOpen}
                    className={styles.root}
                    fullWidth
                >
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            login({ variables: { username: email, password } });
                        }}
                    >
                        <DialogTitle>Auf der Website anmelden</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Melde dich hier mit deinen Zugangsdaten an.
                            </DialogContentText>
                            <ErrorMessage error={error} />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                label="Deine Email-Adresse:"
                                placeholder="beispiel@medienportal.org"
                                type="email"
                                fullWidth
                            />
                            <TextField
                                margin="dense"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                label="Dein Passwort:"
                                placeholder={'Passwort'}
                                type="password"
                                fullWidth
                            />
                            <Typography variant="body1" color="secondary">
                                <Link
                                    component={CollisionLink}
                                    color="inherit"
                                    underline="none"
                                    to={`/password/request-reset`}
                                >
                                    Passwort vergessen?
                                </Link>
                            </Typography>
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
                            <Button type={'submit'} color="secondary">
                                Anmelden
                            </Button>
                        </DialogActions>
                    </form>
                </ResponsiveFullScreenDialog>
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
