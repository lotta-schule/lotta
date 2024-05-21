import * as React from 'react';
import { File } from 'util/model';
import { Box, NoSsr, ScrollToTopButton } from '@lotta-schule/hubert';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import Link from 'next/link';

import styles from './BaseLayout.module.scss';
import { loadTenant } from '../loader/loadTenant';
import { headers } from 'next/headers';
import { getBaseUrl } from '../helper';

export type TenantLayoutProps = {
  children: React.ReactNode | React.ReactNode[];
};

export const TenantLayout = async ({ children }: TenantLayoutProps) => {
  const tenant = await loadTenant();
  const baseUrl = await getBaseUrl();

  const backgroundImageUrl =
    tenant.configuration.backgroundImageFile &&
    File.getFileRemoteLocation(
      baseUrl,
      tenant.configuration.backgroundImageFile
    );

  const baseImageUrl = new URL(backgroundImageUrl);
  baseImageUrl.protocol = 'https:';
  baseImageUrl.searchParams.append('format', 'webp');
  baseImageUrl.searchParams.append('fn', 'cover');
  const imageUrlSimple = new URL(baseImageUrl);
  imageUrlSimple.searchParams.append('width', '1250');
  const imageUrlRetina = new URL(baseImageUrl);
  imageUrlRetina.searchParams.append('width', '2500');

  return (
    <Box className={styles.root}>
      {tenant.configuration.backgroundImageFile && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
@media screen and (min-width: 600px) {
body::after {
background-image: url(${imageUrlSimple.toString()});
background-image: image-set(url(${imageUrlSimple.toString()}) 1x, url(${imageUrlRetina.toString()}) 2x);
}
}
`,
          }}
        />
      )}
      <header className={styles.header}>
        <div className={styles.logoGridItem}>
          {tenant.configuration.logoImageFile && (
            <Link href={'/'} passHref title={'Startseite'}>
              <ResponsiveImage
                resize={'inside'}
                height={80}
                src={File.getFileRemoteLocation(
                  baseUrl,
                  tenant.configuration.logoImageFile
                )}
                alt={`Logo ${tenant.title}`}
              />
            </Link>
          )}
        </div>
        <div className={styles.titleGridItem}>
          <h1>{tenant.title}</h1>
        </div>
      </header>
      {/*<Navbar />*/}
      <main className={styles.main}>
        {children}
        <NoSsr>
          <ScrollToTopButton />
        </NoSsr>
      </main>
    </Box>
  );
};
TenantLayout.displayName = 'TenantLayout';
