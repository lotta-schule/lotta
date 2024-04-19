import * as React from 'react';
import { Item, MenuButton } from '../menu';
import { CloudUpload, Copy, Delete, Edit, ExpandMore } from '../icon';
import { BrowserNode } from './BrowserStateContext';

export type MenuButtonProps = {
  node: BrowserNode;
};

export const FileMenuButton = React.memo(({ node }: MenuButtonProps) => {
  return (
    <MenuButton
      buttonProps={{
        small: true,
        icon: <ExpandMore />,
        'aria-label': 'Dateimenü öffnen',
        style: { width: '2em', height: '2em' },
      }}
      title={'Dateimenü'}
      onAction={(action) => {
        console.log('TODO: file node action', action, ' on node ', node);
        /*switch (action) {
          case 'download': {
            const downloadUrl = File.getFileRemoteLocation(baseUrl, node);
            const anchor = document.createElement('a');
            anchor.href = downloadUrl;
            anchor.download = file.filename;
            anchor.click();
            break;
          }
          case 'rename':
            setIsRenaming(true);
            break;
          case 'move':
            dispatch({ type: 'showMoveFiles' });
            dispatch({
              type: 'setMarkedFiles',
              files: [file],
            });
            break;
          case 'delete':
            dispatch({ type: 'showDeleteFiles' });
            dispatch({
              type: 'setMarkedFiles',
              files: [file],
            });
            break;
        }*/
      }}
    >
      <Item key={'download'} textValue={'Herunterladen'}>
        <CloudUpload />
        Herunterladen
      </Item>
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
FileMenuButton.displayName = 'FileMenuButton';
