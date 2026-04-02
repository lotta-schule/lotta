import * as React from 'react';
import { Navbar } from './navigation/Navbar';
import {
  Box,
  NoSsr,
  PillButton,
  ScrollToTopButton,
} from '@lotta-schule/hubert';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { TenantGlobalStyleTag } from './TenantGlobalStyleTag';
import { useTenant } from 'util/tenant';
import { faStopwatch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

import styles from './BaseLayout.module.scss';

export type BaseLayoutProps = {
  children: React.ReactNode | React.ReactNode[];
};

export const BaseLayout = React.memo(({ children }: BaseLayoutProps) => {
  const tenant = useTenant();
  return (
    <Box className={styles.root}>
      {tenant && <TenantGlobalStyleTag tenant={tenant} />}
      <div className={styles.counter}>
        <PillButton
          className={styles.pillButton}
          icon={<FontAwesomeIcon icon={faStopwatch} />}
        >
          <div className={styles.count}>Noch 84 Tage</div>
        </PillButton>
      </div>
      <header className={styles.header}>
        <div className={styles.logoGridItem}>
          {tenant.logoImageFile && (
            <Link href={'/'} passHref title={'Startseite'}>
              <ResponsiveImage
                file={tenant.logoImageFile}
                format={'logo'}
                sizes={[300, 600]}
                alt={`Logo ${tenant.title}`}
              />
            </Link>
          )}
        </div>
        <div className={styles.titleGridItem}>
          <h1>{tenant.title}</h1>
        </div>
      </header>
      <Navbar />
      <main className={styles.main}>
        {children}
        <NoSsr>
          <ScrollToTopButton />
        </NoSsr>
      </main>
    </Box>
  );
});
BaseLayout.displayName = 'BaseLayout';
