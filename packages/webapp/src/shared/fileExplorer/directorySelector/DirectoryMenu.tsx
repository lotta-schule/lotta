import * as React from 'react';
import { DirectoryModel } from 'model';
import { Menu, Item } from '@lotta-schule/hubert';

export interface DirectoryMenu {
  directories: DirectoryModel[];
  parentDirectoryName?: string;
  onSelectParent?: () => void;
  onSelectDirectory(directory: DirectoryModel): void;
}

export const DirectoryMenu = React.memo(
  ({
    directories,
    parentDirectoryName,
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
            const directory = directories.find((d) => d.id === k);
            if (directory) {
              onSelectDirectory(directory);
            }
          }
        }}
      >
        {onSelectParent &&
          ((
            <Item key={'parent'} textValue={'..'}>
              {parentDirectoryName ?? '..'}
            </Item>
          ) as any)}
        {directories.map((directory) => (
          <Item key={directory.id} textValue={directory.id}>
            {directory.name}
          </Item>
        ))}
      </Menu>
    );
  }
);
DirectoryMenu.displayName = 'DirectoryMenu';
