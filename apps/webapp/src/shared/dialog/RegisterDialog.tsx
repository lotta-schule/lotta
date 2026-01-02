import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  Input,
  Label,
  LoadingButton,
} from '@lotta-schule/hubert';
import { useGetFieldError } from 'util/useGetFieldError';

import RegisterMutation from 'api/mutation/RegisterMutation.graphql';

import styles from './RegisterDialog.module.scss';

export interface RegisterDialogProps {
  isOpen: boolean;
  onRequestClose(): void;
}

export const RegisterDialog = React.memo(
  ({ isOpen, onRequestClose }: RegisterDialogProps) => {
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
        <DialogContent>
          Dein Benutzerkonto wurde erfolgreich eingerichtet. Melde dich mit dem
          Passwort, das du via E-Mail zugesandt bekommen hast, an.
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
        className={styles.form}
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
        <DialogContent>
          Gib hier deine Daten <b>korrekt</b> an, um dich als Nutzer zu
          registrieren.
          <ErrorMessage error={formError || error} />
          <Label label={'Deine Email-Adresse:'}>
            <Input
              autoFocus
              required
              id="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              autoComplete="email"
              disabled={isLoading}
              placeholder="beispiel@medienportal.org"
              type="email"
              maxLength={100}
            />
          </Label>
          {!!getFieldError('email') && (
            <ErrorMessage error={getFieldError('email') as string} />
          )}
          <div className={styles.gridContainer}>
            <div>
              <Label label={'Vorname'}>
                <Input
                  required
                  id="first_name"
                  value={firstName}
                  autoComplete="given-name"
                  onChange={(e) => setFirstName(e.currentTarget.value)}
                  disabled={isLoading}
                  placeholder={'Maxi'}
                  maxLength={50}
                />
              </Label>
              {!!getFieldError('name') && (
                <ErrorMessage error={getFieldError('name') as string} />
              )}
            </div>
            <div>
              <Label label={'Nachname'}>
                <Input
                  required
                  id="last_name"
                  value={lastName}
                  autoComplete="family-name"
                  onChange={(e) => setLastName(e.currentTarget.value)}
                  disabled={isLoading}
                  label="Nachname"
                  placeholder={'Muster'}
                  maxLength={50}
                />
              </Label>
              {!!getFieldError('name') && (
                <ErrorMessage error={getFieldError('name') as string} />
              )}
            </div>
          </div>
          <p>
            Bitte gib hier deinen richtigen, vollständigen Namen an, damit wir
            sehen ob du wirklich Schüler/Lehrer an deiner Schule bist. Deinen
            Spitznamen kannst du jederzeit in deinem Profil ändern.
          </p>
          <Label label={'Spitzname'}>
            <Input
              id="nickname"
              disabled={isLoading}
              placeholder={'Mäxchen'}
              autoComplete="nickname"
              value={nickname}
              maxLength={25}
              onChange={(e) => {
                if (nickname.length === 0 && e.currentTarget.value.length > 0) {
                  setIsHideFullName(true);
                }
                setNickname(e.currentTarget.value);
              }}
            />
          </Label>
          {!!getFieldError('nickname') && (
            <ErrorMessage error={getFieldError('nickname') as string} />
          )}
          <Checkbox isSelected={isHideFullName} onChange={setIsHideFullName}>
            Deinen vollständen Namen öffentlich verstecken
          </Checkbox>
          <p>
            Verstecke deinen vollständigen Namen, damit er nur vom Administrator
            deiner Schule gesehen werden kann. Dein Name taucht nicht in den von
            dir erstellten Artikeln oder in deinem Profil auf. Stattdessen wird
            dein Spitzname angezeigt.
          </p>
          <p>Hast du einen Anmeldeschlüssel?</p>
          <Label label="Anmeldeschlüssel:">
            <Input
              id="code"
              disabled={isLoading}
              label="Anmeldeschlüssel:"
              placeholder={'acb123?!*'}
              onChange={(e) => setGroupKey(e.currentTarget.value)}
            />
          </Label>
          <p>
            Gib hier einen Anmeldeschlüssel ein, um deine Nutzerrechte zu
            erhalten (Schüler, Lehrer, etc.). Du kannst Anmeldeschlüssel auch
            später in deinem Profil bearbeiten.
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              onRequestClose();
            }}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <LoadingButton type={'submit'} state={isLoading ? 'loading' : 'idle'}>
            Registrieren
          </LoadingButton>
        </DialogActions>
      </form>
    );

    return (
      <Dialog
        className={styles.root}
        onRequestClose={onRequestClose}
        title={'Benutzerkonto erstellen'}
        open={isOpen}
      >
        {content}
      </Dialog>
    );
  }
);
RegisterDialog.displayName = 'RegisterDialog';
