import * as React from 'react';
import { MenuButton } from '../menu/index.js';
import { BrowserPath } from './BrowserStateContext.js';
import { MoreVert } from '../icon/index.js';
import { useNodeMenuProps } from './useNodeMenuProps.js';
import { isDirectoryNode } from './utils.js';

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
        style: {
          width: '2em',
          height: '2em',
          marginRight: 'var(--lotta-spacing)',
        },
      }}
      {...menuProps}
    />
  );
});
NodeMenuButton.displayName = 'NodeMenuButton';
