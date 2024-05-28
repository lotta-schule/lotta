import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { File } from 'util/model';
import { getBaseUrl } from 'helper';
import { loadTenant } from 'loader';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './AdminPage.module.scss';

export type AdminPageProps = React.PropsWithChildren<{
  icon?: IconProp;
  title: string;
  hasHomeLink?: boolean;
  className?: string;
}>;

export const AdminPage = async ({
  title,
  icon,
  hasHomeLink,
  className,
  children,
}: AdminPageProps) => {
  const tenant = await loadTenant();
  const baseUrl = await getBaseUrl();

  return (
    <div className={clsx(styles.root, className)}>
      <nav>
        {hasHomeLink && (
          <Link href={'/admin'} title={'Zurück zum Administrations-Hauptmenü'}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </Link>
        )}
        <h2>
          {icon && <FontAwesomeIcon icon={icon} />} {title}
        </h2>
        {tenant.configuration.logoImageFile && (
          <Link href={'/'} title={'Startseite'}>
            <ResponsiveImage
              resize={'inside'}
              height={30}
              src={File.getFileRemoteLocation(
                baseUrl,
                tenant.configuration.logoImageFile
              )}
              alt={`Logo ${tenant.title}`}
            />
          </Link>
        )}
      </nav>
      <div className={styles.backLink}>
        <Link href={'/'}>
          <FontAwesomeIcon icon={faDoorOpen} /> Administrationsbereich verlassen
        </Link>
      </div>
      <section className={styles.contentSection}>{children}</section>
    </div>
  );
};
