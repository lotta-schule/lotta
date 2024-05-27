import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './AdminPage.module.scss';

export type AdminPageProps = React.PropsWithChildren<{
  icon?: IconProp;
  title: string;
  hasHomeLink?: boolean;
  className?: string;
}>;

export const AdminPage = ({
  title,
  icon,
  hasHomeLink,
  className,
  children,
}: AdminPageProps) => {
  return (
    <div className={clsx(styles.root, className)}>
      <>
        <nav>
          {hasHomeLink && (
            <Link
              href={'/admin'}
              title={'Zurück zum Administrations-Hauptmenü'}
            >
              <FontAwesomeIcon icon={faCubes} />
              Hauptmenü
            </Link>
          )}
          {!hasHomeLink && <FontAwesomeIcon icon={faCubes} />}
          <h2>
            {icon && <FontAwesomeIcon icon={icon} />} {title}
          </h2>
        </nav>
        <section className={styles.contentSection}>{children}</section>
      </>
    </div>
  );
};
