import * as React from 'react';
import { Item, MenuButton } from '../menu';
import { BrowserPath, useBrowserState } from './BrowserStateContext';
import { Copy, Delete, Edit, ExpandMore } from '../icon';

export type DirectoryMenuButtonProps = {
  path: BrowserPath;
};

export const DirectoryMenuButton = React.memo(
  ({ path }: DirectoryMenuButtonProps) => {
    const { setCurrentAction } = useBrowserState();
    return (
      <MenuButton
        title={'Ordnermenü'}
        buttonProps={{
          small: true,
          icon: <ExpandMore />,
          'aria-label': 'Ordnermenü öffnen',
          style: { width: '2em', height: '2em' },
        }}
        onAction={(action) => {
          if (action === 'move') {
            setCurrentAction({ type: 'move-directory', path: path });
          }
          console.log('TODO: directory node action', action);
          /*switch (action) {
          case 'rename':
            setIsRenaming(true);
            break;
          case 'move':
            dispatch({
              type: 'showMoveDirectory',
            });
            dispatch({
              type: 'setMarkedDirectories',
              directories: [directory],
            });
            break;
          case 'delete':
            dispatch({
              type: 'showDeleteDirectory',
            });
            dispatch({
              type: 'setMarkedDirectories',
              directories: [directory],
            });
            break;
        }*/
        }}
      >
        <Item key={'rename'} textValue={'Umbenennen'}>
          <Edit />
          Umbenennen
        </Item>
        <Item key={'move'} textValue={'Verschieben'}>
          <Copy />
          Verschieben
        </Item>
        <Item key={'delete'} textValue={'Löschen'}>
          <Delete />
          Löschen
        </Item>
      </MenuButton>
    );
  }
);
DirectoryMenuButton.displayName = 'DirectoryMenuButton';
