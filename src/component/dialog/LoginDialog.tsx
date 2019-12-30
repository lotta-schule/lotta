import React, { FunctionComponent, memo, useState } from 'react';
import { DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField, Link, makeStyles } from '@material-ui/core';
import { useOnLogin } from 'util/user/useOnLogin';
import { CollisionLink } from 'component/general/CollisionLink';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';

export interface LoginDialogProps {
    isOpen: boolean;
    onRequestClose(): void;
}

const useStyles = makeStyles(theme => ({
    root: {
        '& a': {
            display: 'block',
            marginTop: theme.spacing(1),
            float: 'right'
        }
    }
}))

export const LoginDialog: FunctionComponent<LoginDialogProps> = memo(({
    isOpen,
    onRequestClose
}) => {
    const styles = useStyles();
    const [login, { error, loading: isLoading }] = useOnLogin('login', {
        onCompleted: onRequestClose
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const resetForm = () => {
        setEmail('');
        setPassword('');
    }

    return (
        <ResponsiveFullScreenDialog open={isOpen} className={styles.root} fullWidth>
            <form onSubmit={(e) => {
                e.preventDefault();
                login({ variables: { username: email, password } });
            }}>
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
                    <Link
                        component={CollisionLink}
                        color='inherit'
                        underline='none'
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