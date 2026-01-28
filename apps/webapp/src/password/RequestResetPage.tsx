'use client';
import * as React from 'react';
import { Box, Button, Label, Input, ErrorMessage } from '@lotta-schule/hubert';
import { Main } from 'layout';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';

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
          <div className={styles.gridContainer}>
            <div className={styles.helpText}>
              <p>
                Du hast dein Passwort vergessen? Dann gib hier deine
                Email-Adresse ein.
              </p>
              <p>
                Wir senden dir dann einen Link per Email, damit du dein Passwort
                zurücksetzen kannst.
              </p>
            </div>
            <div>
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
                    Sieh in deinem Postfach nach; Falls ein Benutzerkonto
                    gefunden wurde, hast du eine Email bekommen.
                  </p>
                )}
                <ErrorMessage error={error} />
                <Label label="Deine Email-Adresse:">
                  <Input
                    autoFocus
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
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
            </div>
          </div>
        </div>
      </Box>
    </Main>
  );
};
