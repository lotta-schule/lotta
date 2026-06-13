'use client';
import * as React from 'react';
import { Main } from '#/layout/index.js';
import { useRouter, useSearchParams } from 'next/navigation.js';
import { Box, Button, ErrorMessage, Input, Label } from '@lotta-schule/hubert';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { RESET_PASSWORD } from './_graphql/index.js';
import Link from 'next/link.js';

import styles from './RequestResetPage.module.scss';

export const ResetPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] =
    React.useState<Awaited<ReturnType<typeof sendResetPassword>>['data']>();
  const apolloClient = useApolloClient();
  const [sendResetPassword, { error, loading: isLoading }] = useMutation(
    RESET_PASSWORD,
    {
      errorPolicy: 'all',
      onCompleted: (data) => {
        if (data['resetPassword']) {
          apolloClient.resetStore();
          setData(data);
          router.replace('/');
        }
      },
    }
  );
  const [password, setPassword] = React.useState('');
  const [mutationError, setError] = React.useState<string | null>(null);
  const [passwordRepetition, setPasswordRepetition] = React.useState('');
  const e = searchParams.get('e');
  const token = searchParams.get('t');
  const email = e && atob(e);

  const linkToRequestResetPasswordPage = (
    <Link href={'/password/request-reset'}>
      Zurücksetzen des Passworts neu anfragen
    </Link>
  );

  const asLayout = (content: any) => (
    <Main>
      <Box className={styles.root}>{content}</Box>
    </Main>
  );

  if (data) {
    return asLayout(
      <p style={{ color: 'green' }}>
        Dein Passwort wurde geändert. Du wirst gleich angemeldet und zur
        Startseite weitergeleitet.
      </p>
    );
  }

  if (!email || !token) {
    return asLayout(
      <>
        <p>Diese Seite ist nicht gültig.</p>
        {linkToRequestResetPasswordPage}
        <p>&nbsp;</p>
      </>
    );
  }

  return (
    <Main>
      <Box>
        <h4>Passwort wiederherstellen</h4>
        <div className={styles.gridContainer}>
          <div className={styles.helpText}>
            <p>
              Wähle ein neues Passwort. Achte darauf, dass dein Passwort aus
              mindestens 6 Zeichen besteht und nicht leicht zu erraten ist.
              Benutze Passwörter nicht mehrmals.
            </p>
            <p>
              Ein Passwort-Manager ist die beim Verwalten deiner Passwörter
              behilflich.
            </p>
          </div>
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (password !== passwordRepetition) {
                  setError('Passwort und Wiederholung sind nicht gleich.');
                  return;
                }
                sendResetPassword({
                  variables: {
                    email,
                    password,
                    token,
                  },
                });
              }}
            >
              <ErrorMessage error={error || mutationError}>
                {mutationError && linkToRequestResetPasswordPage}
              </ErrorMessage>
              <Label label="Dein neues Passwort:">
                <Input
                  autoFocus
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  disabled={!!data || isLoading}
                  placeholder="Passwort"
                  minLength={6}
                  maxLength={150}
                />
              </Label>
              <Label label="Wiederhole dein neues Passwort zur Sicherheit:">
                <Input
                  id="password-repetition"
                  type="password"
                  value={passwordRepetition}
                  onChange={(e) => setPasswordRepetition(e.currentTarget.value)}
                  disabled={!!data || isLoading}
                  placeholder="Wiederhole dein neues Passwort zur Sicherheit"
                />
              </Label>
              <Button
                type={'submit'}
                disabled={!!data || isLoading}
                style={{ float: 'right' }}
              >
                Passwort setzen
              </Button>
            </form>
          </div>
        </div>
      </Box>
    </Main>
  );
};
