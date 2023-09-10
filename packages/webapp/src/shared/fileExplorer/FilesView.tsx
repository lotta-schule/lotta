import * as React from 'react';
import { FileTable } from './FileTable';
import { Sidebar } from './Sidebar';

import styles from './FilesView.module.scss';

export const FilesView = React.memo(() => {
  return (
    <section className={styles.root}>
      <FileTable />
      <Sidebar />
    </section>
  );
});
FilesView.displayName = 'FilesView';
