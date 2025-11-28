import * as React from 'react';
import { Box, NoSsr, ScrollToTopButton } from '@lotta-schule/hubert';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { loadTenant } from '../loader/loadTenant';
import { Navbar } from './navigation/Navbar';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './TenantLayout.module.scss';

export type TenantLayoutProps = React.PropsWithChildren<{
  /**
   * If true, the main content will take the
   * full height of the viewport, and will rely on
   * its content having a scrollable overflow.
   */
  fullSizeScrollable?: boolean;
}>;

export const TenantLayout = async ({
  children,
  fullSizeScrollable,
}: TenantLayoutProps) => {
  const tenant = await loadTenant();

  return (
    <Box
      className={clsx(styles.root, {
        [styles.fullSizeScrollable]: fullSizeScrollable,
      })}
    >
      <header className={styles.header}>
        <div className={styles.logoGridItem}>
          {tenant.logoImageFile && (
            <Link href={'/'} title={'Startseite'}>
              <ResponsiveImage
                format={'logo'}
                sizes={[300, 600]}
                file={tenant.logoImageFile}
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
        {!fullSizeScrollable && (
          <NoSsr>
            <ScrollToTopButton />
          </NoSsr>
        )}
      </main>
    </Box>
  );
};
TenantLayout.displayName = 'TenantLayout';
