import React, { memo, useState } from 'react';
import { DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField, Dialog, Divider, Typography, Grid } from '@material-ui/core';
import { UserModel } from '../../model';
import { Mutation } from 'react-apollo';
import { LoginMutation } from 'api/mutation/LoginMutation';
import { RegisterMutation } from 'api/mutation/RegisterMutation';
import { theme } from 'theme';

export interface RegisterDialogProps {
    isOpen: boolean;
    onLogin(user: UserModel, token: string): void;
    onAbort(): void;
}

export const RegisterDialog = memo<RegisterDialogProps>(({
    isOpen,
    onLogin,
    onAbort
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                    const error = loginError || registerError;
                    return (
                        <Dialog open={isOpen} fullWidth>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                register({ variables: { email, name, password } });
                            }}>
                                <DialogTitle>Auf der Website registrieren.</DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        Gib hier deine Daten <b>korrekt</b> an, um dich als Nutzer zu registrieren.
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
                                        style={{ marginBottom: theme.spacing(3) }}
                                    />
                                    <Grid container style={{ display: 'flex' }}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                margin="dense"
                                                id="name"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                disabled={isLoading}
                                                label="Vorname"
                                                placeholder={'Maxi'}
                                                type="text"
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                margin="dense"
                                                id="name"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                disabled={isLoading}
                                                label="Nachname"
                                                placeholder={'Muster'}
                                                type="text"
                                                fullWidth
                                            />
                                        </Grid>
                                    </Grid>
                                    <Typography variant="caption">
                                        Bitte gib hier deinen richtigen, vollständigen Namen an, damit wir sehen ob du wirklich Schüler/Lehrer an deiner Schule bist. Deinen Nickname kannst du jederzeit in deinem Profil einstellen oder ändern.
                                    </Typography>
                                    <Typography variant="body1" style={{ marginTop: theme.spacing(3) }}>
                                        Hast du einen Anmeldeschlüssel?
                                    </Typography>
                                    <TextField
                                        margin="dense"
                                        id="code"
                                        disabled={isLoading}
                                        label="Anmeldeschlüssel:"
                                        placeholder={'acb123?!*'}
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        style={{ backgroundColor: '#ff572226' }}
                                    />
                                    <Typography variant="caption" >
                                        Gib hier den Anmeldeschlüssel ein, um deine Nutzerrechte zu erhalten (Schüler, Lehrer, etc.).
                                    </Typography>
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
                                        Registrieren
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