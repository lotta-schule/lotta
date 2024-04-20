import * as React from 'react';
import { Item, MenuButton } from '../menu';
import { BrowserPath, useBrowserState } from './BrowserStateContext';
import { Copy, Delete, Edit, ExpandMore } from '../icon';

export type BrowserNodeMenuButtonProps = {
  path: BrowserPath;
};

export const BrowserNodeMenuButton = React.memo(
  ({ path }: BrowserNodeMenuButtonProps) => {
    const node = path.at(-1);
    const {
      setCurrentAction,
      renameNode,
      moveNode,
      deleteNode,
      getDownloadUrl,
    } = useBrowserState();

    const downloadUrl = React.useMemo(
      () => node && getDownloadUrl?.(node),
      [getDownloadUrl, node]
    );

    if (!node) {
      return null;
    }

    return (
      <MenuButton
        title={
          node.type === 'directory' ? 'Ordnermenü öffnen' : 'Dateimenü öffnen'
        }
        buttonProps={{
          small: true,
          icon: <ExpandMore />,
          'aria-label': 'Ordnermenü öffnen',
          style: { width: '2em', height: '2em' },
        }}
        onAction={(action) => {
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
            setCurrentAction({ type: 'rename-node', path });
          }
          if (action === 'move') {
            setCurrentAction({
              type: 'move-node',
              path,
            });
          }
          if (action === 'delete') {
            setCurrentAction({ type: 'delete-directory', path: path });
          }
        }}
      >
        {
          [
            downloadUrl && (
              <Item key={'download'} textValue={'Herunterladen'}>
                <Copy />
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
          ].filter(Boolean) as React.ReactElement[]
        }
      </MenuButton>
    );
  }
);
BrowserNodeMenuButton.displayName = 'BrowserNodeMenuButton';
