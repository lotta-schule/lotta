import * as React from 'react';
import { useBrowserState } from './BrowserStateContext';
import { FilePreview } from './FilePreview';

import styles from './Explorer.module.scss';

export const Explorer = React.memo(() => {
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
      <FilePreview />
    </div>
  );
});
Explorer.displayName = 'Explorer';
