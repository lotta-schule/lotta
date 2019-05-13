import React, { FunctionComponent, memo, useState, FormEvent } from 'react';
import { DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField, Dialog } from '@material-ui/core';
import { UserModel } from '../../model';
import { mockUsers } from '../../mockData';

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
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const resetForm = () => {
        setPassword('');
        setEmail('');
    }
    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        // TODO: send to api
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        const user = mockUsers.find(user => user.email === email && user.password === password);
        if (user) {
            resetForm();
            onLogin(user, '')
        } else {
            setPassword('');
            setErrorMessage('Nutzername oder Passwort falsch.');
        }
    };
    return (
        <Dialog open={isOpen} fullWidth>
            <form onSubmit={onSubmit}>
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
                        Anmelden
                </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
});