import * as React from 'react';
import { Box } from '@lotta-schule/hubert';
import { Header, Main, Sidebar } from '#/layout';
import Link from 'next/link.js';

import styles from './not-found.module.scss';

// Rendered with the regular page structure (header with user navigation,
// sidebar), so visitors can log in or navigate on from here.
export default function NotFound() {
  return (
    <>
      <Main>
        <Header>
          <Box>
            <h3>Seite nicht gefunden</h3>
          </Box>
        </Header>
        <Box className={styles.content}>
          <p>
            Die Seite konnte nicht gefunden werden. Entweder ist die Adresse
            falsch, die Seite wurde entfernt, oder du hast keine Berechtigung,
            sie zu sehen.
          </p>
          <p>
            <Link href="/">Zur Startseite</Link>
          </p>
        </Box>
      </Main>
      <Sidebar isEmpty />
    </>
  );
}
