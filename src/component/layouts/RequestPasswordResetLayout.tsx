import React, { memo, useEffect, useState } from 'react';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import {
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    makeStyles,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { useMutation } from '@apollo/client';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { RequestPasswordResetMutation } from 'api/mutation/RequestPasswordResetMutation';
import useRouter from 'use-react-router';

const useStyles = makeStyles((theme) => ({
    helpText: {
        [theme.breakpoints.up('md')]: {
            paddingLeft: theme.spacing(2),
        },
    },
    gridContainer: {
        [theme.breakpoints.up('md')]: {
            flexDirection: 'row-reverse',
        },
    },
}));

export const RequestPasswordResetLayout = memo(() => {
    const styles = useStyles();

    const [email, setEmail] = useState('');
    const { history } = useRouter();
    const [
        sendPasswordResetRequest,
        { data, loading: isLoading, error },
    ] = useMutation<boolean, { email: string }>(RequestPasswordResetMutation, {
        fetchPolicy: 'no-cache',
    });

    useEffect(() => {
        // redirect to homepage after 5 seconds when password reset is requested
        data && setTimeout(() => history.push('/'), 5000);
    }, [data, history]);

    return (
        <BaseLayoutMainContent>
            <Card>
                <CardContent>
                    <Typography variant={'h4'}>Passwort vergessen</Typography>
                    <Grid
                        container
                        direction={'row-reverse'}
                        className={styles.gridContainer}
                    >
                        <Grid item sm={12} md={4} className={styles.helpText}>
                            <p>
                                Du hast dein Passwort vergessen? Dann gib hier
                                deine Email-Adresse ein.
                            </p>
                            <p>
                                Wir senden dir dann einen Link per Email, damit
                                du dein Passwort zurücksetzen kannst.
                            </p>
                        </Grid>
                        <Grid item sm={12} md={8}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendPasswordResetRequest({
                                        variables: { email },
                                    });
                                }}
                            >
                                {data && (
                                    <p style={{ color: 'green' }}>
                                        Sieh in deinem Postfach nach; Falls ein
                                        Benutzerkonto gefunden wurde, hast du
                                        eine Email bekommen.
                                    </p>
                                )}
                                <ErrorMessage error={error} />
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={!!data || isLoading}
                                    label="Deine Email-Adresse:"
                                    placeholder="beispiel@medienportal.org"
                                    type="email"
                                    fullWidth
                                />
                                <Button
                                    type={'submit'}
                                    disabled={!!data || isLoading}
                                    style={{ float: 'right' }}
                                >
                                    Anfrage senden
                                </Button>
                            </form>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </BaseLayoutMainContent>
    );
});
export default RequestPasswordResetLayout;
