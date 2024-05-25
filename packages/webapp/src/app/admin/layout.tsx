import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import { Main } from 'layout/Main';
import { User } from 'util/model';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './layout.module.scss';
import { loadCurrentUser } from '../../loader/loadCurrentUser';

interface AdminPageProps {
  children: React.ReactNode;
}

export default async function AdminPage({ children }: AdminPageProps) {
  // TODO: Implement the layout for the administration pages
  const title = 'Administration';
  const hasHomeLink = true;
  const className = 'admin-page';
  // /TODO
  const user = await loadCurrentUser();
  const isAllowed = User.isAdmin(user);

  if (!isAllowed) {
    return <div>Du nicht!</div>;
  }

  return (
    <Main className={clsx(className, styles.root)}>
      <section>
        <>
          <div className={styles.titleBar}>
            {hasHomeLink && (
              <Link
                href={'/admin'}
                passHref
                title={'Zurück zum Administrations-Hauptmenü'}
              >
                <FontAwesomeIcon icon={faCubes} />
                Hauptmenü
              </Link>
            )}
            {!hasHomeLink && <FontAwesomeIcon icon={faCubes} />}
            <h2>{title}</h2>
          </div>
          <section className={styles.contentSection}>{children}</section>
        </>
      </section>
    </Main>
  );
}
