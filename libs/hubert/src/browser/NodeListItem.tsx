import * as React from 'react';
import { VirtualElement } from '@popperjs/core';
import { useDropzone } from 'react-dropzone';
import { Overlay } from '../popover';
import { Menu } from '../menu';
import { Folder, FolderOpen } from '../icon';
import { Checkbox } from '../form';
import { Popover } from '../popover/new/Popover';
import { useIsMobile } from '../util';
import { FileIcon } from './FileIcon';
import {
  BrowserNode,
  BrowserPath,
  useBrowserState,
} from './BrowserStateContext';
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
  isEditingDisabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

let currentContextMenuCloseFn: (() => void) | null = null;

export const NodeListItem = React.memo(
  ({
    parentPath,
    node,
    isEditingDisabled = false,
    isDisabled,
    isSelected = false,
    onClick,
  }: NodeListItemProps) => {
    const nodePath = React.useMemo(
      () => [...parentPath, node] as BrowserPath,
      [parentPath, node]
    );
    const isMobile = useIsMobile();

    const {
      mode,
      currentAction,
      currentPath,
      selected,
      canEdit,
      uploadClient,
      onNavigate,
      onSelect,
      onRequestNodeIcon,
      renameNode,
      resetAction,
    } = useBrowserState();

    const isUploadAllowed = React.useMemo(
      () => isDirectoryNode(node) && canEdit(nodePath),
      [canEdit]
    );

    const onDropAccepted = React.useCallback((files: File[]) => {
      onNavigate(nodePath as BrowserPath<'directory'>);
      for (const file of files) {
        uploadClient?.addFile?.(file, node as BrowserNode<'directory'>);
      }
    }, []);
    const { getRootProps, isDragAccept, isDragActive, isDragReject, rootRef } =
      useDropzone({
        multiple: true,
        noClick: true,
        disabled: !isUploadAllowed,
        noDragEventsBubbling: true,
        onDropAccepted,
      });

    const mouseRef = React.useRef<VirtualElement>({
      getBoundingClientRect: () => rootRef.current!.getBoundingClientRect(),
    });
    const [isContextMenuOpen, setIsContextMenuOpen] = React.useState(false);
    const closeContextMenu = React.useCallback(() => {
      setIsContextMenuOpen(false);
      currentContextMenuCloseFn = null;
    }, []);
    const menuProps = useNodeMenuProps(isSelected ? selected : nodePath);

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
      const customIcon = onRequestNodeIcon?.(node, {
        isSelected,
        isOpen,
        isPreview: false,
      });

      if (customIcon) {
        return customIcon;
      }

      if (isDirectoryNode(node)) {
        return isOpen ? <FolderOpen /> : <Folder />;
      }

      return <FileIcon mimeType={node.meta.mimeType} />;
    }, [node, isOpen, onRequestNodeIcon]);

    React.useEffect(() => {
      if (isSelected && rootRef.current) {
        rootRef.current.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }, [isSelected]);

    const dropzoneProps = getRootProps({
      role: 'option',
      className: clsx(styles.root, {
        [styles.isDragging]: isDragActive,
        [styles.isDragAccept]: isDragAccept,
        [styles.isDragReject]: isDragReject,
        [styles.isOpen]: isOpen,
        [styles.isSelected]: isSelected,
        [styles.isDisabled]: isDisabled,
      }),
      ['aria-selected']: isSelected,
      ['aria-disabled']: isDisabled,
      ['aria-expanded']: isOpen,
      title: node.name,
    });

    return (
      <>
        <li
          {...dropzoneProps}
          onContextMenu={(e) => {
            currentContextMenuCloseFn?.();
            e.preventDefault();
            if (mode !== 'view-and-edit' || isDisabled || isEditingDisabled) {
              return;
            }
            if (!isSelected) {
              onSelect([nodePath]);
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
          onClick={isDisabled || isRenaming ? undefined : (e) => onClick?.(e)}
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
              !isEditingDisabled &&
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
                      ? [
                          ...selected.filter(
                            (path) =>
                              (path.at(-1)?.parent ?? null) ===
                              nodePath.at(-1)?.parent
                          ),
                          nodePath,
                        ]
                      : selected.filter((n) => n.at(-1)?.id !== node.id)
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
          <Overlay>
            <Menu
              {...menuProps}
              onAction={(key) => {
                setIsContextMenuOpen(false);
                return menuProps.onAction(key);
              }}
              aria-label="Kontextmenü"
            />
          </Overlay>
        </Popover>
      </>
    );
  }
);
NodeListItem.displayName = 'NodeListItem';
