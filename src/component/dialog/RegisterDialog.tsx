import * as React from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Grid,
} from '@material-ui/core';
import { useMutation } from '@apollo/client';
import { Button } from 'component/general/button/Button';
import { Checkbox } from 'component/general/form/checkbox';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { Input } from 'component/general/form/input/Input';
import { Label } from 'component/general/label/Label';
import { useGetFieldError } from 'util/useGetFieldError';
import { ResponsiveFullScreenDialog } from './ResponsiveFullScreenDialog';
import RegisterMutation from 'api/mutation/RegisterMutation.graphql';

import styles from './RegisterDialog.module.scss';

export interface RegisterDialogProps {
    isOpen: boolean;
    onRequestClose(): void;
}

export const RegisterDialog = React.memo<RegisterDialogProps>(
    ({ isOpen, onRequestClose }) => {
        const [register, { error, loading: isLoading, data }] = useMutation<{
            register: boolean;
        }>(RegisterMutation);

        const getFieldError = useGetFieldError(error);

        const [firstName, setFirstName] = React.useState('');
        const [lastName, setLastName] = React.useState('');
        const [nickname, setNickname] = React.useState('');
        const [email, setEmail] = React.useState('');
        const [groupKey, setGroupKey] = React.useState('');
        const [isHideFullName, setIsHideFullName] = React.useState(false);
        const [formError, setFormError] = React.useState<string | null>(null);

        const content = data?.register ? (
            <>
                <DialogTitle>Anmeldung erfolgreich.</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Dein Benutzerkonto wurde erfolgreich eingerichtet.
                    </DialogContentText>
                    <DialogContentText>
                        Melde dich mit dem Passwort, das du via E-Mail zugesandt
                        bekommen hast, an.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            onRequestClose();
                        }}
                    >
                        Schließen
                    </Button>
                </DialogActions>
            </>
        ) : (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setFormError(null);
                    register({
                        variables: {
                            user: {
                                email,
                                name: `${firstName} ${lastName}`,
                                nickname,
                                hideFullName: isHideFullName,
                            },
                            groupKey,
                        },
                    });
                }}
            >
                <DialogTitle>Auf der Website registrieren.</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Gib hier deine Daten <b>korrekt</b> an, um dich als
                        Nutzer zu registrieren.
                    </DialogContentText>
                    <ErrorMessage error={formError || error} />
                    <Label label={'Deine Email-Adresse:'}>
                        <Input
                            autoFocus
                            required
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.currentTarget.value)}
                            disabled={isLoading}
                            placeholder="beispiel@medienportal.org"
                            type="email"
                            maxLength={100}
                        />
                    </Label>
                    {!!getFieldError('email') && (
                        <ErrorMessage
                            error={getFieldError('email') as string}
                        />
                    )}
                    <Grid container style={{ display: 'flex' }}>
                        <Grid item xs={12} sm={6}>
                            <Label label={'Vorname'}>
                                <Input
                                    required
                                    id="first_name"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.currentTarget.value)
                                    }
                                    disabled={isLoading}
                                    placeholder={'Maxi'}
                                    maxLength={50}
                                />
                            </Label>
                            {!!getFieldError('name') && (
                                <ErrorMessage
                                    error={getFieldError('name') as string}
                                />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Label label={'Nachname'}>
                                <Input
                                    required
                                    id="last_name"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.currentTarget.value)
                                    }
                                    disabled={isLoading}
                                    label="Nachname"
                                    placeholder={'Muster'}
                                    maxLength={50}
                                />
                                {!!getFieldError('name') && (
                                    <ErrorMessage
                                        error={getFieldError('name') as string}
                                    />
                                )}
                            </Label>
                        </Grid>
                    </Grid>
                    <div>
                        Bitte gib hier deinen richtigen, vollständigen Namen an,
                        damit wir sehen ob du wirklich Schüler/Lehrer an deiner
                        Schule bist. Deinen Spitznamen kannst du jederzeit in
                        deinem Profil ändern.
                    </div>
                    <Label label={'Spitzname'}>
                        <Input
                            id="nickname"
                            disabled={isLoading}
                            placeholder={'Mäxchen'}
                            value={nickname}
                            maxLength={25}
                            onChange={(e) => {
                                if (
                                    nickname.length === 0 &&
                                    e.currentTarget.value.length > 0
                                ) {
                                    setIsHideFullName(true);
                                }
                                setNickname(e.currentTarget.value);
                            }}
                        />
                        {!!getFieldError('nickname') && (
                            <ErrorMessage
                                error={getFieldError('nickname') as string}
                            />
                        )}
                    </Label>
                    <Checkbox
                        checked={isHideFullName}
                        label={'Deinen vollständen Namen öffentlich verstecken'}
                        onChange={(e) =>
                            setIsHideFullName(e.currentTarget.checked)
                        }
                    />
                    <div className={styles.margin}>
                        Verstecke deinen vollständigen Namen, damit er nur vom
                        Administrator deiner Schule gesehen werden kann. Dein
                        Name taucht nicht in den von dir erstellten Artikeln
                        oder in deinem Profil auf. Stattdessen wird dein
                        Spitzname angezeigt.
                    </div>
                    <div className={styles.margin}>
                        Hast du einen Anmeldeschlüssel?
                    </div>
                    <Label label="Anmeldeschlüssel:">
                        <Input
                            id="code"
                            disabled={isLoading}
                            label="Anmeldeschlüssel:"
                            placeholder={'acb123?!*'}
                            onChange={(e) => setGroupKey(e.currentTarget.value)}
                        />
                    </Label>
                    <div>
                        Gib hier einen Anmeldeschlüssel ein, um deine
                        Nutzerrechte zu erhalten (Schüler, Lehrer, etc.). Du
                        kannst Anmeldeschlüssel auch später in deinem Profil
                        bearbeiten.
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            onRequestClose();
                        }}
                    >
                        Abbrechen
                    </Button>
                    <Button type={'submit'} disabled={isLoading}>
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
    }
);
RegisterDialog.displayName = 'RegisterDialog';
