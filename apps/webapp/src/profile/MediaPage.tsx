'use client';

import * as React from 'react';
import { Box } from '@lotta-schule/hubert';
import { LegacyHeader, Main } from 'layout';
import { UserBrowser } from 'shared/browser';

import styles from './MediaPage.module.scss';

export const MediaPage = () => {
  return (
    <Main className={styles.root}>
      <LegacyHeader bannerImageUrl={'/bannerProfil.png'}>
        <h2>Dateien und Medien</h2>
      </LegacyHeader>

      <Box className={styles.container}>
        <UserBrowser />
      </Box>
    </Main>
  );
};
