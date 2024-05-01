import * as React from 'react';
import { Delete, Download, Edit, OpenWith } from '../icon';
import { Item } from '../menu';
import { BrowserPath, useBrowserState } from './BrowserStateContext';
import { isDirectoryNode, isFileNode } from './utils';

export const useNodeMenuProps = (nodePath: BrowserPath | BrowserPath[]) => {
  const nodePaths = Array.isArray(nodePath.at(0))
    ? (nodePath as BrowserPath[])
    : [nodePath as BrowserPath];
  const {
    setCurrentAction,
    setIsFilePreviewVisible,
    renameNode,
    moveNode,
    deleteNode,
    getDownloadUrl,
  } = useBrowserState();

  const downloadUrl = React.useMemo(() => {
    const node = nodePaths?.length === 1 && nodePaths.at(0)?.at(-1);
    return node && getDownloadUrl?.(node);
  }, [getDownloadUrl, nodePaths]);

  const items = React.useMemo(() => {
    if (!nodePaths?.length) {
      return [];
    }
    return [
      downloadUrl && (
        <Item key={'download'} textValue={'Herunterladen'}>
          <Download />
          Herunterladen
        </Item>
      ),
      nodePaths.length === 1 && renameNode && (
        <Item key={'rename'} textValue={'Umbenennen'}>
          <Edit />
          Umbenennen
        </Item>
      ),
      moveNode && (
        <Item key={'move'} textValue={'Verschieben'}>
          <OpenWith />
          Verschieben
        </Item>
      ),
      deleteNode && (
        <Item key={'delete'} textValue={'Löschen'}>
          <Delete />
          Löschen
        </Item>
      ),
    ].filter(Boolean) as React.ReactElement[];
  }, [nodePaths]);

  const onAction = React.useCallback(
    (action: React.Key) => {
      setIsFilePreviewVisible(false);
      if (action === 'download') {
        if (!downloadUrl) {
          return;
        }
        const node = nodePaths.at(0)?.at(-1);
        if (!node) {
          return;
        }
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = node.name ?? 'datei';
        anchor.click();
      }
      if (action === 'rename') {
        const path = nodePaths.at(0);
        if (!path) {
          return;
        }
        setCurrentAction({ type: 'rename-node', path });
      }
      if (action === 'move') {
        setCurrentAction({
          type: 'move-nodes',
          paths: nodePaths,
        });
      }
      if (action === 'delete') {
        if (nodePaths.every((path) => isFileNode(path.at(-1)))) {
          setCurrentAction({ type: 'delete-files', paths: nodePaths });
        } else if (
          nodePaths.length === 1 &&
          isDirectoryNode(nodePaths.at(0)?.at(-1))
        ) {
          setCurrentAction({
            type: 'delete-directory',
            path: nodePaths.at(0) as BrowserPath<'directory'>,
          });
        }
      }
    },
    [downloadUrl, nodePaths, setCurrentAction]
  );

  return React.useMemo(
    () => ({
      children: items,
      onAction,
    }),
    [items, onAction]
  );
};
