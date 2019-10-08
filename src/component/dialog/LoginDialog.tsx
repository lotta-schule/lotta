import React, { FunctionComponent, memo, useState, useEffect } from 'react';
import { DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@material-ui/core';
import { UserModel } from '../../model';
import { useMutation } from 'react-apollo';
import { LoginMutation } from 'api/mutation/LoginMutation';
import { useOnLogin } from 'util/user/useOnLogin';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';

export interface LoginDialogProps {
    isOpen: boolean;
    onRequestClose(): void;
}

export const LoginDialog: FunctionComponent<LoginDialogProps> = memo(({
    isOpen,
    onRequestClose
}) => {
    const onLogin = useOnLogin();

    const [login, { loading: isLoading, error, data }] = useMutation<{ login: { user: UserModel, token: string } }, { username: string, password: string }>(LoginMutation, {
        fetchPolicy: 'no-cache',
        refetchQueries: [`categories`]
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const resetForm = () => {
        setEmail('');
        setPassword('');
    }

    useEffect(() => {
        if (data) {
            onLogin(data.login.user, data.login.token);
            resetForm();
            onRequestClose();
        }
    }, [data, onLogin, onRequestClose]);

    return (
        <ResponsiveFullScreenDialog open={isOpen} fullWidth>
            <form onSubmit={(e) => {
                e.preventDefault();
                login({ variables: { username: email, password } });
            }}>
                <DialogTitle>Auf der Website anmelden</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Melde dich hier mit deinen Zugangsdaten an.
                    </DialogContentText>
                    {error && (
                        <p style={{ color: 'red' }}>{error.message}</p>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
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
                        onChange={e => setPassword(e.target.value)}
                        disabled={isLoading}
                        label="Dein Passwort:"
                        placeholder={'Passwort'}
                        type="password"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            resetForm();
                            onRequestClose();
                        }}
                        color="secondary"
                        variant="outlined"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type={'submit'}
                        disabled={isLoading}
                        variant="contained"
                        color="secondary">
                        Anmelden
                    </Button>
                </DialogActions>
            </form>
        </ResponsiveFullScreenDialog>
    )
});