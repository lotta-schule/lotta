import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Label,
  Input,
} from '@lotta-schule/hubert';
import { useTranslation } from 'react-i18next';
import { EduplacesLoginButton } from 'component/form';
import { useTenant } from 'util/tenant';
import Link from 'next/link';

import styles from './LoginDialog.module.scss';

export interface LoginDialogProps {
  isOpen: boolean;
  onRequestClose(): void;
}

export const LoginDialog = React.memo(
  ({ isOpen, onRequestClose }: LoginDialogProps) => {
    const { t } = useTranslation();
    const tenant = useTenant();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const formRef = React.useRef<HTMLFormElement>(null);

    const isEduplacesEnabled = !!tenant.eduplacesId;

    React.useEffect(() => {
      if (isOpen === false) {
        setEmail('');
        setPassword('');
      }
    }, [isOpen]);

    return (
      <Dialog
        open={isOpen}
        className={styles.root}
        title={t('Login')}
        onRequestClose={onRequestClose}
      >
        <form ref={formRef} action="/auth/login" method="POST">
          <DialogContent>
            Melde dich hier mit deinen Zugangsdaten an.
            <input
              type="hidden"
              name="return_path"
              value={
                typeof window !== 'undefined' ? window.location.pathname : '/'
              }
            />
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
          </DialogContent>
          <DialogActions>
            {isEduplacesEnabled && (
              <EduplacesLoginButton style={{ marginRight: 'auto' }} />
            )}
            <Button
              onClick={() => {
                onRequestClose();
              }}
            >
              {t('Cancel')}
            </Button>
            <Button type={'submit'}>{t('Login')}</Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);
LoginDialog.displayName = 'LoginDialog';
