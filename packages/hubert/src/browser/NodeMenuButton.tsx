import * as React from 'react';
import { MenuButton } from '../menu';
import { BrowserPath } from './BrowserStateContext';
import { MoreVert } from '../icon';
import { useNodeMenuProps } from './useNodeMenuProps';
import { isDirectoryNode } from './utils';

export type NodeMenuButtonProps = {
  path: BrowserPath;
};

export const NodeMenuButton = React.memo(({ path }: NodeMenuButtonProps) => {
  const menuProps = useNodeMenuProps(path);
  const node = path.at(-1);

  if (!node) {
    return null;
  }

  return (
    <MenuButton
      title={isDirectoryNode(node) ? 'Ordnermenü öffnen' : 'Dateimenü öffnen'}
      buttonProps={{
        small: true,
        icon: <MoreVert />,
        'aria-label': isDirectoryNode(node)
          ? 'Ordnermenü öffnen'
          : 'Dateimenü öffnen',
        style: { width: '2em', height: '2em' },
      }}
      {...menuProps}
    />
  );
});
NodeMenuButton.displayName = 'NodeMenuButton';
