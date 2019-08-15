import React, { FunctionComponent, memo, useState } from 'react';
import { DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField, Dialog } from '@material-ui/core';
import { UserModel } from '../../model';
import { Mutation } from 'react-apollo';
import { LoginMutation } from 'api/mutation/LoginMutation';
import { RegisterMutation } from 'api/mutation/RegisterMutation';

export interface LoginDialogProps {
    isOpen: boolean;
    onLogin(user: UserModel, token: string): void;
    onAbort(): void;
}

export const LoginDialog: FunctionComponent<LoginDialogProps> = memo(({
    isOpen,
    onLogin,
    onAbort
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const resetForm = () => {
        setPassword('');
        setEmail('');
    }
    return (
        <Mutation<{ login: { user: UserModel, token: string } }, { username: string, password: string }>
            mutation={LoginMutation}
            fetchPolicy={'no-cache'}
        >{(login, { data: loginData, error: loginError, loading: isLoginLoading }) => {
            if (isOpen && loginData) {
                resetForm();
                onLogin(loginData.login.user, loginData.login.token);
            }
            return (
                <Mutation<{ register: { user: UserModel, token: string } }, { email: string, name: string, password: string }>
                    mutation={RegisterMutation}
                    fetchPolicy={'no-cache'}
                >{(register, { data: registerData, error: registerError, loading: isRegisterLoading }) => {
                    if (isOpen && registerData) {
                        resetForm();
                        onLogin(registerData.register.user, registerData.register.token);
                    }

                    const isLoading = isLoginLoading || isRegisterLoading;
                    const error = loginError || registerError;
                    return (
                        <Dialog open={isOpen} fullWidth>
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
                                            onAbort();
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
                        </Dialog>
                    );
                }}</Mutation>
            );
        }}</Mutation>
    )
});