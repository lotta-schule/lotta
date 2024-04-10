import * as React from 'react';
import { Input } from '../form/input';
import { CloudUpload, CreateNewFolder } from '../icon';

import styles from './BrowserToolbar.module.scss';

export const BrowserToolbar = React.memo(() => {
  return (
    <div className={styles.root}>
      <div className={styles.leftContainer}>file name</div>
      <div className={styles.searchField}>
        {' '}
        <Input placeholder="Datei suchen" />
      </div>
      <div className={styles.rightContainer}>
        <CreateNewFolder />
        <CloudUpload />
      </div>
    </div>
  );
});
BrowserToolbar.displayName = 'BrowserToolbar';
