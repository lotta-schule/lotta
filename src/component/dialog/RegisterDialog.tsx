import React, { memo, useState } from 'react';
import {
    Checkbox, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Button, TextField, Typography, Grid, makeStyles, Theme, FormGroup, FormControlLabel
} from '@material-ui/core';
import { fade } from '@material-ui/core/styles';
import { useGetFieldError } from 'util/useGetFieldError';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';
import { useMutation } from '@apollo/client';
import { RegisterMutation } from 'api/mutation/RegisterMutation';

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

export const RegisterDialog = memo<RegisterDialogProps>(({ isOpen, onRequestClose }) => {
    const [register, { error, loading: isLoading, data }] = useMutation<{ register: boolean }>(RegisterMutation);
    const styles = useStyles();

    const getFieldError = useGetFieldError(error);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [groupKey, setGroupKey] = useState('');
    const [isHideFullName, setIsHideFullName] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const content =
        data?.register ? (
            <>
                <DialogTitle>Anmeldung erfolgreich.</DialogTitle>
                <DialogContent>
                    <DialogContentText>Dein Benutzerkonto wurde erfolgreich eingerichtet.</DialogContentText>
                    <DialogContentText>
                        Melde dich mit dem Passwort, das du via E-Mail zugesandt bekommen hast, an.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            onRequestClose();
                        }}
                        color="secondary"
                        variant="outlined"
                    >
                        Schließen
                    </Button>
                </DialogActions>
            </>
        ) : (
            <form onSubmit={e => {
                e.preventDefault();
                setFormError(null);
                register({
                    variables: {
                        user: {
                            email,
                            name: `${firstName} ${lastName}`,
                            nickname,
                            hideFullName: isHideFullName
                        },
                        groupKey
                    }
                });
            }}>
                <DialogTitle>Auf der Website registrieren.</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Gib hier deine Daten <b>korrekt</b> an, um dich als Nutzer zu registrieren.
                    </DialogContentText>
                    <ErrorMessage error={formError || error} />
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
                        error={!!getFieldError('email')}
                        helperText={getFieldError('email')}
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
                                error={!!getFieldError('name')}
                                helperText={getFieldError('email')}
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
                                error={!!getFieldError('name')}
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
                        error={!!getFieldError('nickname')}
                        helperText={getFieldError('nickname')}
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
                            control={<Checkbox checked={isHideFullName} onChange={(_e, checked) => setIsHideFullName(checked)} />}
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
                        Gib hier einen Anmeldeschlüssel ein, um deine Nutzerrechte zu erhalten (Schüler, Lehrer, etc.).
                        Du kannst Anmeldeschlüssel auch später in deinem Profil bearbeiten.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
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
        );

    return (
        <ResponsiveFullScreenDialog open={isOpen} fullWidth>
            {content}
        </ResponsiveFullScreenDialog>
    );
});
