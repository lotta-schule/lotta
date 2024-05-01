import * as React from 'react';
import { VirtualElement } from '@popperjs/core';
import { Menu } from '../menu';
import { Folder, FolderOpen } from '../icon';
import { Checkbox } from '../form';
import { Popover } from '../popover/new/Popover';
import { useIsMobile } from '../util';
import { FileIcon } from './FileIcon';
import { BrowserNode, useBrowserState } from './BrowserStateContext';
import { NodeRenameInput } from './NodeRenameInput';
import { NodeMenuButton } from './NodeMenuButton';
import { isDirectoryNode } from './utils';
import { useNodeMenuProps } from './useNodeMenuProps';
import clsx from 'clsx';

import styles from './NodeListItem.module.scss';

export type NodeListItemProps = {
  parentPath: BrowserNode<'directory'>[];
  node: BrowserNode;
  isDisabled?: boolean;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

let currentContextMenuCloseFn: (() => void) | null = null;

export const NodeListItem = React.memo(
  ({
    parentPath,
    node,
    isDisabled,
    isSelected,
    onClick,
  }: NodeListItemProps) => {
    const nodePath = React.useMemo(
      () => [...parentPath, node],
      [parentPath, node]
    );
    const isMobile = useIsMobile();

    const {
      mode,
      currentAction,
      currentPath,
      selected,
      onSelect,
      onRequestNodeIcon,
      renameNode,
      resetAction,
    } = useBrowserState();

    const listItemRef = React.useRef<HTMLLIElement>(null);
    const mouseRef = React.useRef<VirtualElement>({
      getBoundingClientRect: () => listItemRef.current!.getBoundingClientRect(),
    });
    const [isContextMenuOpen, setIsContextMenuOpen] = React.useState(false);
    const closeContextMenu = React.useCallback(() => {
      setIsContextMenuOpen(false);
      currentContextMenuCloseFn = null;
    }, []);
    const menuProps = useNodeMenuProps(nodePath);

    const isOpen = React.useMemo(
      () =>
        node.type === 'directory' && currentPath.some((n) => n.id === node.id),
      [currentPath, node.id]
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

      return <FileIcon mimeType={node.meta.mimeType} />;
    }, [node, isOpen, onRequestNodeIcon]);

    React.useEffect(() => {
      if (isSelected && listItemRef.current) {
        listItemRef.current.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }
    }, [isSelected]);

    return (
      <>
        <li
          className={clsx(styles.root, {
            [styles.isOpen]: isOpen,
            [styles.isSelected]: isSelected,
            [styles.isDisabled]: isDisabled,
          })}
          role="option"
          aria-selected={isSelected}
          aria-disabled={isDisabled}
          aria-expanded={isOpen}
          title={node.name}
          key={node.id}
          ref={listItemRef}
          onContextMenu={(e) => {
            currentContextMenuCloseFn?.();
            e.preventDefault();
            if (!isSelected) {
              onSelect([node]);
            }
            setIsContextMenuOpen(true);
            currentContextMenuCloseFn = closeContextMenu;
            mouseRef.current = {
              getBoundingClientRect: () => {
                return {
                  top: e.clientY + 20,
                  left: e.clientX,
                  right: e.clientX,
                  bottom: e.clientY + 20,
                  height: 0,
                  width: 0,
                } as ClientRect;
              },
            };
          }}
          onClick={isDisabled ? undefined : (e) => onClick?.(e)}
        >
          <div className={styles.fileIcon}>{nodeIcon}</div>
          <div className={styles.fileName}>
            {isRenaming && (
              <NodeRenameInput path={nodePath} onRequestClose={resetAction} />
            )}
            {!isRenaming && <span>{node.name}</span>}
          </div>
          <div className={styles.editSection}>
            {mode === 'view-and-edit' &&
              !isDisabled &&
              isDirectoryNode(node) &&
              isMobile && <NodeMenuButton path={nodePath} />}
            {mode === 'select-multiple' && node.type === 'file' && (
              <Checkbox
                aria-label={`Datei ${node.name} auswählen`}
                isSelected={isSelected}
                isDisabled={isDisabled}
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
        <Popover
          isOpen={isContextMenuOpen}
          onClose={() => setIsContextMenuOpen(false)}
          trigger={mouseRef.current}
          placement="bottom-start"
        >
          <Menu
            {...menuProps}
            onAction={(key) => {
              setIsContextMenuOpen(false);
              return menuProps.onAction(key);
            }}
            aria-label="Kontextmenü"
          />
        </Popover>
      </>
    );
  }
);
NodeListItem.displayName = 'NodeListItem';
