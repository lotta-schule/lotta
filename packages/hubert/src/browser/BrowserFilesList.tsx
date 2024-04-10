import * as React from 'react';
import { Close, Delete, Edit } from '../icon';
import clsx from 'clsx';

import styles from './BrowserFilesList.module.scss';

export type BrowserFilesListProps = {
  narrow?: boolean;
};

export const BrowserFilesList = React.memo(
  ({ narrow }: BrowserFilesListProps) => {
    return (
      <ul className={clsx(styles.root, { [styles.narrow]: narrow })}>
        {Array.from({ length: 10 }).map((_, i) => (
          <li className={styles.selected} key={i}>
            <div className={styles.fileIcon}>
              <Close />
            </div>
            <div className={styles.fileName}>Dateiname 1</div>
            <div className={styles.fileEdit}>
              <Edit />
              <Delete />
            </div>
          </li>
        ))}
      </ul>
    );
  }
);
BrowserFilesList.displayName = 'BrowserFilesList';
