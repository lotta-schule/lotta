import * as React from 'react';
import { BrowserFilesList } from './BrowserFilesList';
import { BrowserFilePreview } from './BrowserFilePreview';
import { Home } from '../icon';

import styles from './BrowserFilesWindow.module.scss';

export const BrowserFilesWindow = React.memo(() => {
  const [isShowPreview, setIsShowPreview] = React.useState(false);
  return (
    <div className={styles.root}>
      <input
        type={'checkbox'}
        checked={isShowPreview}
        onChange={(e) => {
          setIsShowPreview(e.currentTarget.checked);
        }}
      />{' '}
      Vorschau anzeigen
      <div className={styles.wrapper}>
        <div className={styles.BrowserColumns}>
          <BrowserFilesList narrow={!isShowPreview} />
          <BrowserFilesList narrow={!isShowPreview} />
          <BrowserFilesList narrow={!isShowPreview} />
          <BrowserFilesList narrow={!isShowPreview} />
        </div>
        {isShowPreview && <BrowserFilePreview />}
      </div>
      <div className={styles.paths}>
        {' '}
        <Home /> / folder 1 / folder 2 / file{' '}
      </div>
    </div>
  );
});
BrowserFilesWindow.displayName = 'BrowserFilesWindow';
