import * as React from 'react';
import { useIsMobile } from '../util';
import { useBrowserState } from './BrowserStateContext';
import { FilePreview } from './FilePreview';
import clsx from 'clsx';

import styles from './Explorer.module.scss';

export type ExplorerProps = {
  className?: string;
};

export const Explorer = React.memo(({ className }: ExplorerProps) => {
  const isMobile = useIsMobile();
  const {
    currentPath,
    isFilePreviewVisible,
    renderNodeList: RenderNodeList,
  } = useBrowserState();
  return (
    <div className={clsx(styles.root, className)}>
      {(!isMobile || currentPath.length === 0) && <RenderNodeList path={[]} />}
      {currentPath
        .map((currentNode, i) => (
          <RenderNodeList
            key={currentNode.parent}
            path={currentPath.slice(0, i + 1)}
          />
        ))
        .filter(
          (_, i) =>
            !isMobile || (!isFilePreviewVisible && i === currentPath.length - 1)
        )}
      {(!isMobile || isFilePreviewVisible) && (
        <FilePreview className={styles.nodeInfo} />
      )}
    </div>
  );
});
Explorer.displayName = 'Explorer';
