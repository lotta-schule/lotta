import * as React from 'react';
import { useBrowserState, BrowserNode } from './BrowserStateContext';
import { BrowserNodeListItem } from './BrowserNodeListItem';
import clsx from 'clsx';

import styles from './BrowserFilesList.module.scss';

export type BrowserFilesListProps = {
  path: BrowserNode[];
};

export const BrowserFilesList = React.memo(
  ({ path }: BrowserFilesListProps) => {
    const listRef = React.useRef<HTMLElement>(null);

    const { nodes, currentPath } = useBrowserState();

    React.useEffect(() => {
      if (listRef.current && path.length === currentPath.length) {
        listRef.current.scrollIntoView({ inline: 'end', behavior: 'smooth' });
      }
    }, [path, currentPath]);

    const parentNode = path.at(-1) ?? null;

    const childNodes = React.useMemo(
      () => nodes.filter((n) => n.parent === (parentNode?.id || null)),
      [nodes, parentNode]
    );

    if (childNodes.length === 0) {
      return (
        <div ref={listRef as any} className={clsx(styles.root, styles.isEmpty)}>
          Keine Dateien
        </div>
      );
    }
    return (
      <ul className={styles.root} ref={listRef as any}>
        {childNodes.map((node) => (
          <BrowserNodeListItem key={node.id} parentPath={path} node={node} />
        ))}
      </ul>
    );
  }
);
BrowserFilesList.displayName = 'BrowserFilesList';
