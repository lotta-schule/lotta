import * as React from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Link,
    makeStyles,
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
import { Label } from 'component/general/label/Label';
import { Input } from 'component/general/form/input/Input';

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

export const LoginDialog = React.memo<LoginDialogProps>(
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
        ] = React.useState(false);
        const [email, setEmail] = React.useState('');
        const [password, setPassword] = React.useState('');
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
                                    id="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.currentTarget.value)
                                    }
                                    disabled={isLoading}
                                    placeholder={'Passwort'}
                                    type="password"
                                />
                            </Label>
                            <Link
                                component={CollisionLink}
                                color="inherit"
                                underline="none"
                                to={`/password/request-reset`}
                            >
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
