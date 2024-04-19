import * as React from 'react';
import { Item, MenuButton } from 'menu';
import { BrowserNode } from './BrowserStateContext';
import { Copy, Delete, Edit, ExpandMore } from 'icon';

export type MenuButtonProps = {
  node: BrowserNode;
};

export const DirectoryMenuButton = React.memo(({ node }: MenuButtonProps) => {
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
});
DirectoryMenuButton.displayName = 'DirectoryMenuButton';
