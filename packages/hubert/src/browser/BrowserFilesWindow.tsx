import * as React from 'react';
import { useBrowserState } from './BrowserStateContext';
import { BrowserFilePreview } from './BrowserFilePreview';

import styles from './BrowserFilesWindow.module.scss';

export const BrowserFilesWindow = React.memo(() => {
  const { currentPath, renderNodeList: RenderNodeList } = useBrowserState();
  return (
    <div className={styles.root}>
      <div className={styles.BrowserColumns}>
        <RenderNodeList parentPath={[]} />
        {currentPath.map((currentNode, i) => (
          <RenderNodeList
            key={currentNode.parent}
            parentPath={currentPath.slice(0, i + 1)}
          />
        ))}
      </div>
      <BrowserFilePreview />
    </div>
  );
});
BrowserFilesWindow.displayName = 'BrowserFilesWindow';
