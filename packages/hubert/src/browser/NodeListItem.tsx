import * as React from 'react';
import { Folder, FolderOpen } from '../icon';
import { BrowserNode, useBrowserState } from './BrowserStateContext';
import { NodeRenameInput } from './NodeRenameInput';
import { NodeMenuButton } from './NodeMenuButton';
import clsx from 'clsx';

import styles from './NodeListItem.module.scss';

export type NodeListItemProps = {
  parentPath: BrowserNode[];
  node: BrowserNode;
};

export const NodeListItem = React.memo(
  ({ parentPath, node }: NodeListItemProps) => {
    const {
      currentAction,
      currentPath,
      selected,
      onSelect,
      onNavigate,
      onRequestNodeIcon,
      renameNode,
      resetAction,
    } = useBrowserState();

    const path = React.useMemo(() => [...parentPath, node], [parentPath, node]);

    const isOpen = React.useMemo(
      () => currentPath.some((n) => n.id === node.id),
      [currentPath, node.id]
    );

    const isSelected = React.useMemo(
      () => selected.some((n) => n.id === node.id),
      [selected, node.id]
    );

    const isRenaming = React.useMemo(
      () =>
        renameNode !== undefined &&
        currentAction?.type === 'rename-node' &&
        currentAction.path.at(-1)?.id === node.id,
      [currentAction, node.id, renameNode]
    );

    const nodeIcon = React.useMemo(() => {
      const customIcon = onRequestNodeIcon?.(node);

      if (customIcon) {
        return customIcon;
      }

      if (node.type === 'directory') {
        return isOpen ? <FolderOpen /> : <Folder />;
      }

      return null;
    }, [node, isOpen, onRequestNodeIcon]);

    return (
      <li
        className={clsx(styles.root, {
          [styles.isOpen]: isOpen,
          [styles.isSelected]: isSelected,
        })}
        aria-selected={isSelected}
        key={node.id}
        onClick={() => {
          if (node.type === 'directory') {
            onSelect([]);
            onNavigate(path);
          } else {
            onNavigate(parentPath);
            onSelect([node]);
          }
        }}
      >
        <div className={styles.fileIcon}>{nodeIcon}</div>
        <div className={styles.fileName}>
          {isRenaming && (
            <NodeRenameInput path={path} onRequestClose={resetAction} />
          )}
          {!isRenaming && <span>{node.name}</span>}
        </div>
        <div className={styles.editSection}>
          <NodeMenuButton path={path} />
        </div>
      </li>
    );
  }
);
NodeListItem.displayName = 'NodeListItem';
