import * as React from 'react';
import { Navbar } from './navigation/Navbar';
import { Box, NoSsr, ScrollToTopButton } from '@lotta-schule/hubert';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { TenantGlobalStyleTag } from './TenantGlobalStyleTag';
import { useTenant } from 'util/tenant';
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
      <header className={styles.header}>
        <div className={styles.logoGridItem}>
          {tenant.logoImageFile && (
            <Link href={'/'} passHref title={'Startseite'}>
              <ResponsiveImage
                file={tenant.logoImageFile}
                format={'logo'}
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
