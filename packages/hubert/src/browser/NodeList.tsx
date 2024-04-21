import * as React from 'react';
import {
  useBrowserState,
  BrowserNode,
  BrowserPath,
} from './BrowserStateContext';
import { NodeListItem } from './NodeListItem';
import clsx from 'clsx';

import styles from './NodeList.module.scss';

export type NodeListProps = {
  path: BrowserPath;
  nodes: null | BrowserNode[];
};

export const NodeList = React.memo(({ path, nodes }: NodeListProps) => {
  const listRef = React.useRef<HTMLElement>(null);

  const { currentPath, isNodeDisabled } = useBrowserState();

  React.useEffect(() => {
    if (listRef.current && path.length === currentPath.length) {
      listRef.current.scrollIntoView({
        inline: 'end',
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [path, currentPath]);

  if (!nodes?.length) {
    return (
      <div ref={listRef as any} className={clsx(styles.root, styles.isEmpty)}>
        {nodes !== null && 'Keine Dateien'}
      </div>
    );
  }
  return (
    <ul className={styles.root} ref={listRef as any}>
      {nodes.map((node) => (
        <NodeListItem
          key={node.id}
          parentPath={path}
          node={node}
          isDisabled={isNodeDisabled?.(node) ?? false}
        />
      ))}
    </ul>
  );
});
NodeList.displayName = 'NodeList';
