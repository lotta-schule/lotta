import React, { memo, useState } from 'react';
import {
    Checkbox, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Button, TextField, Typography, Grid, makeStyles, Theme, FormGroup, FormControlLabel
} from '@material-ui/core';
import { UserModel } from '../../model';
import { RegisterMutation } from 'api/mutation/RegisterMutation';
import { useMutation } from '@apollo/react-hooks';
import { useOnLogin } from 'util/user/useOnLogin';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';
import { fade } from '@material-ui/core/styles/colorManipulator';

const useStyles = makeStyles((theme: Theme) => ({
    margin: {
        marginBottom: theme.spacing(3),
    },
    groupKeyInput: {
        backgroundColor: fade(theme.palette.secondary.main, .15)
    }
}));

export interface RegisterDialogProps {
    isOpen: boolean;
    onRequestClose(): void;
}

export const RegisterDialog = memo<RegisterDialogProps>(({
    isOpen,
    onRequestClose
}) => {
    const onLogin = useOnLogin({ redirect: '/profile' });
    const styles = useStyles();

    const [register, { loading: isLoading, error }] = useMutation<{ register: { token: string } }, { user: Partial<UserModel> & { password: string }, groupKey?: string }>(RegisterMutation, {
        update: (_, { data }) => {
            if (data) {
                onLogin(data.register.token);
                resetForm();
                onRequestClose();
            }
        }
    });

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepetition, setPasswordRepetition] = useState('');
    const [groupKey, setGroupKey] = useState('');
    const [isHideFullName, setIsHideFullName] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const resetForm = () => {
        setPassword('');
        setPasswordRepetition('');
        setEmail('');
    }

    return (
        <ResponsiveFullScreenDialog open={isOpen} fullWidth>
            <form onSubmit={e => {
                e.preventDefault();
                setFormError(null);
                if (password !== passwordRepetition) {
                    setFormError('Password und wiederholtes Passwort stimmen nicht überein');
                } else {
                    register({
                        variables: {
                            user: {
                                email,
                                name: `${firstName} ${lastName}`,
                                password,
                                nickname,
                                hideFullName: isHideFullName
                            },
                            groupKey
                        }
                    });
                }
            }}>
                <DialogTitle>Auf der Website registrieren.</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Gib hier deine Daten <b>korrekt</b> an, um dich als Nutzer zu registrieren.
                    </DialogContentText>
                    {(formError || error) && (
                        <p style={{ color: 'red' }}>{formError || error!.message}</p>
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
                        inputProps={{ maxLength: 100 }}
                        fullWidth
                        required
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
                        inputProps={{ maxLength: 100 }}
                        required
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
                        className={styles.margin}
                        inputProps={{ maxLength: 100 }}
                        fullWidth
                        required
                    />
                    <Grid container style={{ display: 'flex' }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="dense"
                                id="first_name"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                disabled={isLoading}
                                label="Vorname"
                                placeholder={'Maxi'}
                                type="text"
                                inputProps={{ maxLength: 50 }}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="dense"
                                id="last_name"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                disabled={isLoading}
                                label="Nachname"
                                placeholder={'Muster'}
                                type="text"
                                inputProps={{ maxLength: 50 }}
                                fullWidth
                                required
                            />
                        </Grid>
                    </Grid>
                    <Typography variant="caption">
                        Bitte gib hier deinen richtigen, vollständigen Namen an, damit wir sehen ob du wirklich Schüler/Lehrer an deiner Schule bist.
                        Deinen Spitznamen kannst du jederzeit in deinem Profil ändern.
                    </Typography>
                    <TextField
                        margin="dense"
                        id="nickname"
                        disabled={isLoading}
                        label="Spitzname"
                        placeholder={'Mäxchen'}
                        value={nickname}
                        inputProps={{ maxLength: 25 }}
                        onChange={e => {
                            if (nickname.length === 0 && e.target.value.length > 0) {
                                setIsHideFullName(true);
                            }
                            setNickname(e.target.value);
                        }}
                        type="text"
                        fullWidth
                    />
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={isHideFullName} onChange={(e, checked) => setIsHideFullName(checked)} />}
                            label={'Deinen vollständen Namen öffentlich verstecken'}
                        />
                    </FormGroup>
                    <Typography variant="caption" component={'div'} className={styles.margin}>
                        Verstecke deinen vollständigen Namen, damit er nur vom Administrator deiner Schule gesehen werden kann.
                        Dein Name taucht nicht in den von dir erstellten Artikeln oder in deinem Profil auf. Stattdessen wird dein Spitzname angezeigt.
                    </Typography>
                    <Typography variant="body1" className={styles.margin}>
                        Hast du einen Anmeldeschlüssel?
                    </Typography>
                    <TextField
                        margin="dense"
                        id="code"
                        disabled={isLoading}
                        label="Anmeldeschlüssel:"
                        placeholder={'acb123?!*'}
                        onChange={e => setGroupKey(e.target.value)}
                        type="text"
                        fullWidth
                        variant="outlined"
                        className={styles.groupKeyInput}
                    />
                    <Typography variant="caption" >
                        Gib hier den Anmeldeschlüssel ein, um deine Nutzerrechte zu erhalten (Schüler, Lehrer, etc.).
                    </Typography>
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
                        Registrieren
                    </Button>
                </DialogActions>
            </form>
        </ResponsiveFullScreenDialog>
    );
});