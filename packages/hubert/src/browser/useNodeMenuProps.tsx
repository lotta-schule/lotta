import * as React from 'react';
import { Copy, Delete, Download, Edit } from '../icon';
import { Item } from '../menu';
import { BrowserPath, useBrowserState } from './BrowserStateContext';

export const useNodeMenuProps = (nodePath: BrowserPath) => {
  const node = nodePath.at(-1);
  const { setCurrentAction, renameNode, moveNode, deleteNode, getDownloadUrl } =
    useBrowserState();

  const downloadUrl = React.useMemo(
    () => node && getDownloadUrl?.(node),
    [getDownloadUrl, node]
  );

  const items = React.useMemo(() => {
    if (!node) {
      return [];
    }
    return [
      downloadUrl && (
        <Item key={'download'} textValue={'Herunterladen'}>
          <Download />
          Herunterladen
        </Item>
      ),
      renameNode && (
        <Item key={'rename'} textValue={'Umbenennen'}>
          <Edit />
          Umbenennen
        </Item>
      ),
      moveNode && (
        <Item key={'move'} textValue={'Verschieben'}>
          <Copy />
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
  }, [node]);

  const onAction = React.useCallback(
    (action: React.Key) => {
      if (!node) {
        return;
      }
      if (action === 'download') {
        if (!downloadUrl) {
          return;
        }
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = node.name ?? 'datei';
        anchor.click();
      }
      if (action === 'rename') {
        setCurrentAction({ type: 'rename-node', path: nodePath });
      }
      if (action === 'move') {
        setCurrentAction({
          type: 'move-node',
          path: nodePath,
        });
      }
      if (action === 'delete') {
        if (node.type === 'file') {
          setCurrentAction({ type: 'delete-files', paths: [nodePath] });
        } else {
          setCurrentAction({ type: 'delete-directory', path: nodePath });
        }
      }
    },
    [downloadUrl, node, nodePath]
  );

  return {
    children: items,
    onAction,
  };
};
