import * as React from 'react';
import { CircularProgress } from '../progress';
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

    const [childNodes, setChildNodes] = React.useState<BrowserNode[] | null>(
      null
    );
    const { currentPath, onRequestChildNodes } = useBrowserState();

    React.useEffect(() => {
      if (listRef.current && path.length === currentPath.length) {
        listRef.current.scrollIntoView({ inline: 'end', behavior: 'smooth' });
      }
    }, [path, currentPath]);

    const parentNode = React.useMemo(() => path.at(-1) ?? null, [path]);

    React.useEffect(() => {
      onRequestChildNodes(parentNode).then(setChildNodes);
    }, [parentNode]);

    if (!childNodes?.length) {
      return (
        <div ref={listRef as any} className={clsx(styles.root, styles.isEmpty)}>
          {childNodes === null ? <CircularProgress /> : 'Keine Dateien'}
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
