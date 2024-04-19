import * as React from 'react';
import { BrowserNode } from '../../BrowserStateContext';
import { Item, Menu } from '../../../menu';
import { KeyboardArrowLeft } from '../../../icon';

export interface DirectoryMenu {
  directoryNodes: BrowserNode[];
  parentNode?: BrowserNode;
  onSelectParent?: () => void;
  onSelectDirectory(directory: BrowserNode): void;
}

export const DirectoryMenu = React.memo(
  ({
    directoryNodes,
    parentNode,
    onSelectParent,
    onSelectDirectory,
  }: DirectoryMenu) => {
    return (
      <Menu
        style={{ width: '100%' }}
        title={'directory'}
        onAction={(k) => {
          if (k === 'parent') {
            onSelectParent?.();
          } else {
            const directory = directoryNodes.find((d) => d.id === k);
            if (directory) {
              onSelectDirectory(directory);
            }
          }
        }}
      >
        {onSelectParent &&
          ((
            <Item key={'parent'} textValue={'..'}>
              <KeyboardArrowLeft />
              <span>
                ../
                {parentNode?.name ?? JSON.stringify(parentNode)}
              </span>
            </Item>
          ) as any)}
        {directoryNodes.map((directory) => (
          <Item key={directory.id} textValue={directory.id}>
            {directory.name}
          </Item>
        ))}
      </Menu>
    );
  }
);
DirectoryMenu.displayName = 'DirectoryMenu';
