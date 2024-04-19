import * as React from 'react';
import { Folder, FolderOpen } from '../icon';
import { BrowserNode, useBrowserState } from './BrowserStateContext';
import { DirectoryMenuButton } from './DirectoryMenuButton';
import { FileMenuButton } from './FileMenuButton';
import clsx from 'clsx';

import styles from './BrowserNodeListItem.module.scss';

export type BrowserNodeListItemProps = {
  parentPath: BrowserNode[];
  node: BrowserNode;
};

export const BrowserNodeListItem = React.memo(
  ({ parentPath, node }: BrowserNodeListItemProps) => {
    const { currentPath, selected, onSelect, onNavigate, getNodeIcon } =
      useBrowserState();

    const isOpen = React.useMemo(
      () => currentPath.some((n) => n.id === node.id),
      [currentPath, node.id]
    );

    const isSelected = React.useMemo(
      () => selected.some((n) => n.id === node.id),
      [selected, node.id]
    );

    const nodeIcon = React.useMemo(() => {
      const customIcon = getNodeIcon?.(node);

      if (customIcon) {
        return customIcon;
      }

      if (node.type === 'directory') {
        return isOpen ? <FolderOpen /> : <Folder />;
      }

      return null;
    }, [node, isOpen, getNodeIcon]);

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
            onNavigate([...parentPath, node]);
          } else {
            onNavigate(parentPath);
            onSelect([node]);
          }
        }}
      >
        <div className={styles.fileIcon}>{nodeIcon}</div>
        <div className={styles.fileName}>{node.name}</div>
        <div>
          {node.type === 'directory' && <DirectoryMenuButton node={node} />}
          {node.type === 'file' && <FileMenuButton node={node} />}
        </div>
      </li>
    );
  }
);
BrowserNodeListItem.displayName = 'BrowserNodeListItem';
