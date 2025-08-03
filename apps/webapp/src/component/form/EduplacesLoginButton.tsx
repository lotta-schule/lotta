import * as React from 'react';

import {
  Button,
  ButtonProps,
  Eduplaces as EduplacesIcon,
} from '@lotta-schule/hubert';
import { useTranslation } from 'react-i18next';

import styles from './EduplacesLoginButton.module.scss';
import clsx from 'clsx';

export const EduplacesLoginButton = React.memo(
  ({ className, ...props }: Omit<ButtonProps, 'onClick' | 'icon'>) => {
    const { t } = useTranslation();

    const loginUrl = React.useMemo(() => {
      const baseUrl = 'https://auth.sandbox.eduplaces.dev/oauth2/auth';
      const params = new URLSearchParams({
        client_id: 'b8000d71-260d-4c53-9dd4-c4c5553ff709',
        response_type: 'code',
        scope:
          'openid role pseudonym groups school schooling_level school_name school_official_id',
        redirect_uri: 'http://localhost:4000/auth/oauth/eduplaces/callback',
        state: 'tid=2 p=/',
      });

      return `${baseUrl}?${params.toString()}`;
    }, []);

    const onClick = React.useCallback(() => {
      window.location.href = loginUrl;
    }, [loginUrl]);

    return (
      <Button
        className={clsx(styles.root, className)}
        onClick={onClick}
        icon={<EduplacesIcon />}
        loading={false}
        {...props}
      >
        {t('Login with Eduplaces')}
      </Button>
    );
  }
);
EduplacesLoginButton.displayName = 'EduplacesLoginButton';
