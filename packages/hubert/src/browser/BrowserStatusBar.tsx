import * as React from 'react';
import { Home } from '../icon';
import { useBrowserState } from './BrowserStateContext';

import styles from './BrowserStatusBar.module.scss';

export const BrowserStatusBar = React.memo(() => {
  const { currentPath, selected } = useBrowserState();

  return (
    <div className={styles.root}>
      <Home />
      {currentPath.map((node) => (
        <span key={node!.id}>&nbsp;/&nbsp;{node!.name}</span>
      ))}
      {selected.length === 1 && <span>&nbsp;/&nbsp;{selected[0].name}</span>}
    </div>
  );
});
BrowserStatusBar.displayName = 'BrowserStatusBar';
