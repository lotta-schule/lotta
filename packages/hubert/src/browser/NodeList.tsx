import * as React from 'react';
import {
  useBrowserState,
  BrowserNode,
  BrowserPath,
} from './BrowserStateContext';
import { NodeListItem } from './NodeListItem';
import clsx from 'clsx';

import styles from './NodeList.module.scss';
import { isDirectoryNode } from './utils';

export type NodeListProps = {
  path: BrowserPath<'directory'>;
  nodes: null | BrowserNode[];
};

export const NodeList = React.memo(({ path, nodes }: NodeListProps) => {
  const listRef = React.useRef<HTMLElement>(null);

  const { currentPath, selected, isNodeDisabled, mode, onNavigate, onSelect } =
    useBrowserState();

  const sortedSelected = React.useMemo(
    () =>
      [...selected].sort((n1, n2) =>
        n1.type !== n2.type
          ? Number(n1.type === 'directory')
          : n1.name.localeCompare(n2.name)
      ),
    [selected]
  );

  React.useEffect(() => {
    if (listRef.current && path.length === currentPath.length) {
      listRef.current?.scrollIntoView({
        inline: 'start',
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [path, currentPath]);

  const onKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      const currentListSelected = sortedSelected.filter(
        (s) => s.parent === (path.at(-1)?.id ?? null)
      );
      if (e.key === 'ArrowDown') {
        const reversedNodeIndex = Array.from(nodes ?? [])
          .reverse()
          .findIndex((n) => currentListSelected.find((s) => s.id === n.id));

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
          onSelect?.([...sortedSelected, nextNode]);
          if (currentPath.at(-1)?.id !== nextNode.parent) {
            onNavigate?.(path);
          }
          return;
        }

        onSelect?.([nextNode]);
        if (isDirectoryNode(nextNode)) {
          onNavigate?.([...path, nextNode]);
        }
      }

      if (e.key === 'ArrowUp') {
        const firstSelectedNodeIndex =
          nodes?.findIndex((n) =>
            currentListSelected.find((s) => s.id === n.id)
          ) ?? -1;

        if (firstSelectedNodeIndex < 1) {
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
          onSelect?.([...sortedSelected, previousNode]);
          if (currentPath.at(-1)?.id !== previousNode.parent) {
            onNavigate?.(path);
          }
          return;
        }

        onSelect?.([previousNode]);
        if (isDirectoryNode(previousNode)) {
          onNavigate?.([...path, previousNode]);
        }
      }

      if (e.key === 'ArrowLeft') {
        const selectedNode = selected.at(-1);

        if (
          !selectedNode ||
          selectedNode.parent !== (path.at(-1)?.id ?? null)
        ) {
          return;
        }

        const targetNode = path.at(-1);

        if (targetNode) {
          onSelect?.([targetNode]);
        }
      }

      if (e.key === 'ArrowRight') {
        const selectedDirectory = selected.at(-1);
        const firstNode = nodes?.at(0);

        if (!firstNode || !selectedDirectory) {
          return;
        }

        if (
          !isDirectoryNode(selectedDirectory) ||
          selectedDirectory.id !== firstNode.parent
        ) {
          return;
        }

        onSelect?.([firstNode]);
        onNavigate?.(path);
      }
    },
    [nodes, sortedSelected, onSelect]
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
