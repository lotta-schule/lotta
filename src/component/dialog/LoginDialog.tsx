import React, { FunctionComponent, memo, useState } from 'react';
import { DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField, Dialog, FormControlLabel, Checkbox } from '@material-ui/core';
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
    const [isNewUser, setIsNewUser] = useState(false);
    const [passwordRepetition, setPasswordRepetition] = useState('');
    const [name, setName] = useState('');
    const resetForm = () => {
        setPassword('');
        setPasswordRepetition('');
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
                    const errorMessage = loginError || registerError;
                    return (
                        <Dialog open={isOpen} fullWidth>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (isNewUser) {
                                    register({ variables: { email, name, password } });
                                } else {
                                    login({ variables: { username: email, password } });
                                }
                            }}>
                                <DialogTitle>Beim Medienportal anmelden</DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        Melde dich hier mit deinen Zugangsdaten an.
                                        </DialogContentText>
                                    {errorMessage && (
                                        <p style={{ color: 'red' }}>{errorMessage}</p>
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
                                    <FormControlLabel
                                        control={
                                            <Checkbox checked={isNewUser} onChange={(e, checked) => setIsNewUser(checked)} value={'register'} />
                                        }
                                        label="Ich möchte ein neues Benutzerkonto anlegen"
                                    />
                                    {isNewUser && (
                                        <>
                                            <TextField
                                                margin="dense"
                                                id="password_repetition"
                                                value={passwordRepetition}
                                                onChange={e => setPasswordRepetition(e.target.value)}
                                                disabled={isLoading}
                                                label="Passwort wiederholen:"
                                                placeholder={'Passwort'}
                                                type="password"
                                                fullWidth
                                            />
                                            <TextField
                                                margin="dense"
                                                id="name"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                disabled={isLoading}
                                                label="Name:"
                                                placeholder={'Benutzername'}
                                                type="text"
                                                fullWidth
                                            />
                                        </>
                                    )}
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        onClick={() => {
                                            resetForm();
                                            onAbort();
                                        }}
                                        color="secondary"
                                    >
                                        Abbrechen
                                        </Button>
                                    <Button
                                        type={'submit'}
                                        disabled={isLoading}
                                        color="primary">
                                        {isNewUser ? 'Registrieren' : 'Anmelden'}
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