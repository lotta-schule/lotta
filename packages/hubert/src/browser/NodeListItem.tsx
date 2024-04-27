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
};

let currentContextMenuCloseFn: (() => void) | null = null;

export const NodeListItem = React.memo(
  ({ parentPath, node, isDisabled }: NodeListItemProps) => {
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
      onNavigate,
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

      return <FileIcon mimeType={node.meta.mimeType} />;
    }, [node, isOpen, onRequestNodeIcon]);

    React.useEffect(() => {
      if (isSelected && listItemRef.current) {
        listItemRef.current.scrollIntoView({
          inline: 'start',
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
          onClick={
            isDisabled
              ? undefined
              : (e) => {
                  if (mode === 'select') {
                    if (isDirectoryNode(node)) {
                      onSelect([]);
                      onNavigate(parentPath);
                    } else {
                      if (node.parent !== currentPath.at(-1)?.id) {
                        onNavigate(parentPath);
                      }
                      onSelect([node]);
                    }
                  } else if (mode === 'select-multiple') {
                    if (isDirectoryNode(node)) {
                      onNavigate([...parentPath, node]);
                      onSelect([
                        ...selected.filter((n) => n.type !== 'directory'),
                        node,
                      ]);
                    } else {
                      if (
                        !(
                          (
                            e.target as HTMLElement
                          ).parentElement?.querySelector(
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
                    if (isDirectoryNode(node)) {
                      onNavigate([...parentPath, node]);
                    }
                    onSelect([node]);
                  }
                }
          }
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
