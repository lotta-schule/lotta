import * as React from 'react';
import { Grid } from '@material-ui/core';
import { Box } from 'shared/general/layout/Box';
import { Main } from 'layout';
import { Button } from 'shared/general/button/Button';
import { useMutation } from '@apollo/client';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { Label } from 'shared/general/label/Label';
import { Input } from 'shared/general/form/input/Input';
import { useRouter } from 'next/router';

import RequestPasswordResetMutation from 'api/mutation/RequestPasswordResetMutation.graphql';

import styles from './RequestResetPage.module.scss';

export const RequestResetPage = () => {
    const router = useRouter();
    const [email, setEmail] = React.useState('');

    const [sendPasswordResetRequest, { data, loading: isLoading, error }] =
        useMutation<boolean, { email: string }>(RequestPasswordResetMutation, {
            fetchPolicy: 'no-cache',
        });

    React.useEffect(() => {
        // redirect to homepage after 5 seconds when password reset is requested
        if (data) {
            setTimeout(() => router.push('/'), 5000);
        }
    }, [data, router]);

    return (
        <Main className={styles.root}>
            <Box className={styles.container}>
                <div>
                    <h4>Passwort vergessen</h4>
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
                                <Label label="Deine Email-Adresse:">
                                    <Input
                                        autoFocus
                                        id="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.currentTarget.value)
                                        }
                                        disabled={!!data || isLoading}
                                        placeholder="beispiel@medienportal.org"
                                        type="email"
                                    />
                                </Label>
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
                </div>
            </Box>
        </Main>
    );
};
