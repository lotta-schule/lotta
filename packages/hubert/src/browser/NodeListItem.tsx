import * as React from 'react';
import { Folder, FolderOpen } from '../icon';
import { BrowserNode, useBrowserState } from './BrowserStateContext';
import { NodeRenameInput } from './NodeRenameInput';
import { NodeMenuButton } from './NodeMenuButton';
import { Checkbox } from '../form';
import clsx from 'clsx';

import styles from './NodeListItem.module.scss';

export type NodeListItemProps = {
  parentPath: BrowserNode[];
  node: BrowserNode;
};

export const NodeListItem = React.memo(
  ({ parentPath, node }: NodeListItemProps) => {
    const {
      mode,
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
      () =>
        node.type === 'directory' && currentPath.some((n) => n.id === node.id),
      [currentPath, node.id]
    );

    const isSelected = React.useMemo(
      () => node.type === 'file' && selected.some((n) => n.id === node.id),
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
        aria-expanded={isOpen}
        title={node.name}
        key={node.id}
        onClick={(e) => {
          if (mode === 'select-multiple') {
            if (node.type === 'directory') {
              onNavigate(path);
            } else {
              if (
                !(
                  (e.target as HTMLElement).parentElement?.querySelector(
                    'input[type=checkbox]'
                  ) ||
                  (e.target instanceof HTMLInputElement &&
                    e.target.type === 'checkbox')
                )
              ) {
                // if only the checkbox was clicked, don't navigate
                // but if this was a click on the label do navigate
                onNavigate(parentPath);
              } else {
                // on the other hand, if the checkbox was clicked, its
                // onSelect has already been called, so we don't need to
                // call it again
                return;
              }
              if (isSelected) {
                onSelect(selected.filter((n) => n.id !== node.id));
              } else {
                onSelect([...selected, node]);
              }
            }
          } else {
            if (node.type === 'directory') {
              onSelect([]);
              onNavigate(path);
            } else {
              if (node.parent !== currentPath.at(-1)?.id) {
                onNavigate(parentPath);
              }
              onSelect([node]);
            }
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
          {mode === 'view-and-edit' && <NodeMenuButton path={path} />}
          {mode === 'select-multiple' && node.type === 'file' && (
            <Checkbox
              aria-label={`Datei ${node.name} auswählen`}
              isSelected={isSelected}
              onChange={(isSelected) => {
                onSelect(
                  isSelected
                    ? [...selected, node]
                    : selected.filter((n) => n.id !== node.id)
                );
              }}
            />
          )}
        </div>
      </li>
    );
  }
);
NodeListItem.displayName = 'NodeListItem';
