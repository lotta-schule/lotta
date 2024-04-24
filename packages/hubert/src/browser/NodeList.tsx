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

  const { currentPath, selected, isNodeDisabled, mode, onSelect } =
    useBrowserState();

  React.useEffect(() => {
    if (listRef.current && path.length === currentPath.length) {
      listRef.current.scrollIntoView({
        inline: 'end',
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [path, currentPath]);

  const onKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        const reversedNodeIndex = Array.from(nodes ?? [])
          .reverse()
          .findIndex((n) => selected.find((s) => s.id === n.id));

        const lastSelectedNodeIndex =
          reversedNodeIndex > -1 ? nodes!.length - 1 - reversedNodeIndex : -1;
        if (lastSelectedNodeIndex < 0) {
          return;
        }

        const nextNode = nodes?.at(lastSelectedNodeIndex + 1);

        if (!nextNode) {
          return;
        }

        if (e.shiftKey) {
          if (mode === 'select') {
            return;
          }
          onSelect?.([...selected, nextNode]);
          return;
        }

        onSelect?.([nextNode]);
      }

      if (e.key === 'ArrowUp') {
        const firstSelectedNodeIndex =
          nodes?.findIndex((n) => selected.find((s) => s.id === n.id)) ?? -1;

        if (firstSelectedNodeIndex < 0) {
          return;
        }

        const previousNode = nodes?.at(firstSelectedNodeIndex - 1);

        if (!previousNode) {
          return;
        }

        if (e.shiftKey) {
          if (mode === 'select') {
            return;
          }
          onSelect?.([previousNode, ...selected]);
          return;
        }

        onSelect?.([previousNode]);
      }
    },
    [nodes, selected, onSelect]
  );

  React.useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  if (!nodes?.length) {
    return (
      <div ref={listRef as any} className={clsx(styles.root, styles.isEmpty)}>
        {nodes !== null && 'Keine Dateien'}
      </div>
    );
  }

  return (
    <ul className={styles.root} role="listbox" ref={listRef as any}>
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
