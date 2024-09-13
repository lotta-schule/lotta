import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Button, Close } from '@lotta-schule/hubert';
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
  takesFullSpace?: boolean;
  className?: string;
}>;

export const AdminPage = async ({
  title,
  icon,
  hasHomeLink,
  takesFullSpace,
  className,
  children,
}: AdminPageProps) => {
  const tenant = await loadTenant();
  const baseUrl = await getBaseUrl();

  return (
    <div
      className={clsx(styles.root, className, {
        [styles.isRootPage]: !hasHomeLink,
      })}
    >
      <nav>
        {hasHomeLink && (
          <Link
            className={styles.homeLink}
            href={'/admin'}
            title={'Zurück zum Administrations-Hauptmenü'}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </Link>
        )}
        <h2>
          {icon && <FontAwesomeIcon icon={icon} />} {title}
        </h2>
        {tenant.logoImageFile && (
          <Link href={'/'} title={'Startseite'} className={styles.logoLink}>
            <ResponsiveImage
              resize={'inside'}
              height={30}
              src={File.getFileRemoteLocation(baseUrl, tenant.logoImageFile)}
              alt={`Logo ${tenant.title}`}
            />
          </Link>
        )}
        <Button
          icon={<Close />}
          component={Link}
          href={'/'}
          className={clsx(styles.logoLinkClose, {
            [styles.forceLogoLinkClose]: !tenant.logoImageFile,
          })}
        />
      </nav>
      <div
        className={clsx(styles.contentSection, {
          [styles.takesFullSpace]: takesFullSpace,
        })}
      >
        {children}
      </div>
    </div>
  );
};
