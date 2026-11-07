import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
  Label,
  Input,
} from '@lotta-schule/hubert';
import { useTranslation } from 'react-i18next';
import { EduplacesLoginButton } from '#/component/form';
import { useTenant } from '#/util/tenant';
import Link from 'next/link.js';

import styles from './LoginDialog.module.scss';

export interface LoginDialogProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

export const LoginDialog = React.memo(
  ({ isOpen, onRequestClose }: LoginDialogProps) => {
    const { t } = useTranslation();
    const tenant = useTenant();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const formRef = React.useRef<HTMLFormElement>(null);

    const isEduplacesEnabled = !!tenant.eduplacesId;
    const isEmailRegistrationEnabled =
      tenant.configuration.isEmailRegistrationEnabled;

    React.useEffect(() => {
      if (isOpen === false) {
        setEmail('');
        setPassword('');
        setError(null);
      }
    }, [isOpen]);

    // Submit via fetch so a failed login can be shown in the dialog.
    // Without JavaScript, the form is posted as usual.
    const onSubmit = React.useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
          const response = await fetch(e.currentTarget.action, {
            method: 'POST',
            body: new URLSearchParams({ username: email, password }),
            credentials: 'same-origin',
            // on success, the server sets the cookies and redirects
            redirect: 'manual',
          });
          if (response.type === 'opaqueredirect' || response.ok) {
            window.location.assign('/');
            return;
          }
          setError(
            response.status === 401
              ? t('Wrong email or password.')
              : t('Login failed. Please try again later.')
          );
        } catch {
          setError(t('Login failed. Please try again later.'));
        }
        setIsSubmitting(false);
      },
      [email, password, t]
    );

    return (
      <Dialog
        open={isOpen}
        aria-hidden={!isOpen}
        className={styles.root}
        title={t('Login')}
        onRequestClose={onRequestClose}
      >
        <form
          ref={formRef}
          action="/auth/login"
          method="POST"
          onSubmit={onSubmit}
        >
          <DialogContent>
            <ErrorMessage error={error} />
            {isEmailRegistrationEnabled && (
              <>
                {t('Login with your email and password.')}
                <Label label={t('Your email address:')}>
                  <Input
                    autoFocus
                    id={'email'}
                    name="username"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    placeholder={t('example@lotta.schule')}
                    type={'email'}
                    autoComplete={'email'}
                    required
                  />
                </Label>
                <Label label={t('Your password:')}>
                  <Input
                    type={'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    placeholder={t('Password')}
                    autoComplete={'current-password'}
                    required
                  />
                </Label>
                <Link href={`/password/request-reset`}>
                  {t('Forgot your password?')}
                </Link>
              </>
            )}
            {!isEmailRegistrationEnabled && (
              <p>{t('Log in using your Eduplaces account.')}</p>
            )}
          </DialogContent>
          <DialogActions>
            {isEduplacesEnabled && isEmailRegistrationEnabled && (
              <EduplacesLoginButton style={{ marginRight: 'auto' }} />
            )}
            <Button
              onClick={() => {
                onRequestClose();
              }}
            >
              {t('Cancel')}
            </Button>
            {isEduplacesEnabled && !isEmailRegistrationEnabled && (
              <EduplacesLoginButton />
            )}
            {isEmailRegistrationEnabled && (
              <Button type={'submit'} disabled={isSubmitting}>
                {t('Login')}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
LoginDialog.displayName = 'LoginDialog';
