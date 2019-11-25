import React, { memo, useState, useEffect } from 'react';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { Button, Card, CardContent, Grid, Link, TextField, Typography, makeStyles } from '@material-ui/core';
import { useOnLogin } from 'util/user/useOnLogin';
import { useMutation } from '@apollo/react-hooks';
import { ResetPasswordMutation } from 'api/mutation/ResetPasswordMutation';
import { useLocationSearchQuery } from 'util/useLocationSearchQuery';
import { CollisionLink } from 'component/general/CollisionLink';

const useStyles = makeStyles(theme => ({
    helpText: {
        [theme.breakpoints.up('md')]: {
            paddingLeft: theme.spacing(2)
        }
    },
    gridContainer: {
        [theme.breakpoints.up('md')]: {
            flexDirection: 'row-reverse'
        }
    }
}))

export const ResetPasswordLayout = memo(() => {
    const styles = useStyles();

    const onLogin = useOnLogin({ redirect: '/' });
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [passwordRepetition, setPasswordRepetition] = useState('');
    const { e, t: token } = useLocationSearchQuery<{ e: string; t: string; }>();
    const [sendResetPassword, { data, loading: isLoading, error: mutationError }] = useMutation<{ resetPassword: { token: string } }, { email: string; password: string; token: string; }>(
        ResetPasswordMutation, { fetchPolicy: 'no-cache' }
    );
    const email = e && atob(e);

    useEffect(() => {
        if (data) {
            setTimeout(() => onLogin(data.resetPassword.token), 6000);
        }
    })

    const linkToRequestResetPasswordPage = (
        <Link
            component={CollisionLink}
            color='inherit'
            underline='none'
            to={'/password/request-reset'}
        >
            Zurücksetzen des Passworts neu anfragen
        </Link>
    );

    const asLayout = (content: any) => (
        <BaseLayoutMainContent>
            <Card>
                <CardContent>
                    {content}
                </CardContent>
            </Card>
        </BaseLayoutMainContent>
    );

    if (data) {
        return asLayout(
            <p style={{ color: 'green' }}>
                Dein Passwort wurde geändert. Du wirst gleich angemeldet und zur Startseite weitergeleitet.
            </p>
        );
    }

    if (!email || !token) {
        return asLayout(<>
            <p>Diese Seite ist nicht gültig.</p>
            {linkToRequestResetPasswordPage}
            <p>&nbsp;</p>
        </>);
    }

    return (
        <BaseLayoutMainContent>
            <Card>
                <CardContent>
                    <Typography variant={'h4'}>Passwort wiederherstellen</Typography>
                    <Grid container direction={'row-reverse'} className={styles.gridContainer}>
                        <Grid item sm={12} md={4} className={styles.helpText}>
                            <p>
                                Wähle ein neues Passwort. Achte darauf, dass dein Passwort aus mindestens 6 Zeichen besteht und nicht leicht zu erraten ist.
                                Benutze Passwörter nicht mehrmals.
                            </p>
                            <p>
                                Ein Passwort-Manager ist die beim Verwalten deiner Passwörter behilflich.
                            </p>
                        </Grid>
                        <Grid item sm={12} md={8}>
                            <form onSubmit={e => {
                                e.preventDefault();
                                if (password !== passwordRepetition) {
                                    setError('Passwort und Wiederholung sind nicht gleich.');
                                    return;
                                }
                                sendResetPassword({
                                    variables: {
                                        email,
                                        password,
                                        token
                                    }
                                });
                            }}>
                                {(error || mutationError) && (
                                    <div>
                                        <p style={{ color: 'red' }}>{mutationError ? mutationError.message : error}</p>
                                        {mutationError && linkToRequestResetPasswordPage}
                                        <p>&nbsp;</p>
                                    </div>
                                )}
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={!!data || isLoading}
                                    label="Dein neues Passwort:"
                                    placeholder="Passwort"
                                    type="password"
                                    inputProps={{ minlength: 6, maxLength: 150 }}
                                    fullWidth
                                />
                                <TextField
                                    margin="dense"
                                    id="password-repetition"
                                    value={passwordRepetition}
                                    onChange={e => setPasswordRepetition(e.target.value)}
                                    disabled={!!data || isLoading}
                                    label="Wiederhole dein neues Passwort zur Sicherheit:"
                                    placeholder="Wiederhole dein neues Passwort zur Sicherheit"
                                    type="password"
                                    fullWidth
                                />
                                <Button
                                    type={'submit'}
                                    disabled={!!data || isLoading}
                                    variant="contained"
                                    color="secondary"
                                    style={{ float: 'right' }}
                                >
                                    Passwort setzen
                                </Button>
                            </form>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </BaseLayoutMainContent >
    );
});