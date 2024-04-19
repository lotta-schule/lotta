import * as React from 'react';
import { useBrowserState } from './BrowserStateContext';
import { BrowserFilesList } from './BrowserFilesList';
import { BrowserFilePreview } from './BrowserFilePreview';

import styles from './BrowserFilesWindow.module.scss';

export const BrowserFilesWindow = React.memo(() => {
  const { currentPath } = useBrowserState();
  return (
    <div className={styles.root}>
      <div className={styles.BrowserColumns}>
        <BrowserFilesList path={[]} />
        {currentPath.map((currentNode, i) => (
          <BrowserFilesList
            key={currentNode.parent}
            path={currentPath.slice(0, i + 1)}
          />
        ))}
      </div>
      <BrowserFilePreview />
    </div>
  );
});
BrowserFilesWindow.displayName = 'BrowserFilesWindow';
