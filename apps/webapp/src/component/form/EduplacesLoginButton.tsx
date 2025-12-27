'use client';

import * as React from 'react';

import {
  Button,
  ButtonProps,
  Eduplaces as EduplacesIcon,
} from '@lotta-schule/hubert';
import { useServerData } from 'shared/ServerDataContext';
import { useTranslation } from 'react-i18next';
import { redirectTo } from 'util/browserLocation';

import styles from './EduplacesLoginButton.module.scss';
import clsx from 'clsx';

export const EduplacesLoginButton = React.memo(
  ({ className, ...props }: Omit<ButtonProps, 'onClick' | 'icon'>) => {
    const { t } = useTranslation();
    const { socketUrl } = useServerData();

    const loginUrl = React.useMemo(() => {
      const { host, protocol } = new URL(
        socketUrl || '/api',
        window.location.href
      );
      const isSecure = protocol === 'https:' || protocol === 'wss:';
      const baseUrl = `${isSecure ? 'https' : 'http'}://${host}/auth/oauth/eduplaces/login`;

      const params = new URLSearchParams({
        client_id: 'b8000d71-260d-4c53-9dd4-c4c5553ff709',
        response_type: 'code',
        scope:
          'openid role pseudonym groups school schooling_level school_name school_official_id',
      });

      const url = `${baseUrl}?${params.toString()}`;

      return url;
    }, [socketUrl]);

    const onClick = React.useCallback(() => {
      redirectTo(loginUrl);
    }, [loginUrl]);

    return (
      <Button
        className={clsx(styles.root, className)}
        onClick={onClick}
        icon={<EduplacesIcon />}
        {...props}
      >
        {t('Login with Eduplaces')}
      </Button>
    );
  }
);
EduplacesLoginButton.displayName = 'EduplacesLoginButton';
