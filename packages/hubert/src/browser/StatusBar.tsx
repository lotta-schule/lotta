import * as React from 'react';
import { Home } from '../icon';
import { BrowserPath, useBrowserState } from './BrowserStateContext';

import styles from './StatusBar.module.scss';

export const StatusBar = React.memo(() => {
  const { currentPath, selected, onNavigate } = useBrowserState();
  const onClickLink = React.useCallback(
    (path: BrowserPath) => (e: React.MouseEvent) => {
      e.preventDefault();
      onNavigate(path);
    },
    [onNavigate]
  );

  return (
    <div className={styles.root} role="navigation">
      <a
        href="#"
        title="Wurzelverzeichnis"
        onClick={(e) => {
          e.preventDefault();
          onNavigate([]);
        }}
      >
        <Home />
      </a>
      {currentPath.map((node, i) => (
        <>
          <span className={styles.separator}>/</span>
          <a
            className={styles.pathComponent}
            href={'#'}
            key={node.id}
            onClick={onClickLink(currentPath.slice(0, i + 1))}
          >
            {node.name}
          </a>
        </>
      ))}
      {selected.length === 1 && (
        <span className={styles.pathComponent}>
          &nbsp;/&nbsp;{selected[0].name}
        </span>
      )}
    </div>
  );
});
StatusBar.displayName = 'StatusBar';
