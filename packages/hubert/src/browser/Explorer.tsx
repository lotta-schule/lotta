import * as React from 'react';
import { useBrowserState } from './BrowserStateContext';
import { FilePreview } from './FilePreview';
import clsx from 'clsx';

import styles from './Explorer.module.scss';

export type ExplorerProps = {
  className?: string;
};

export const Explorer = React.memo(({ className }: ExplorerProps) => {
  const { currentPath, renderNodeList: RenderNodeList } = useBrowserState();
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.browserColumns}>
        <RenderNodeList parentPath={[]} />
        {currentPath.map((currentNode, i) => (
          <RenderNodeList
            key={currentNode.parent}
            parentPath={currentPath.slice(0, i + 1)}
          />
        ))}
      </div>
      <FilePreview className={styles.nodeInfo} />
    </div>
  );
});
Explorer.displayName = 'Explorer';
