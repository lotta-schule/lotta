import * as React from 'react';
import { Toolbar } from '../../../layout/Toolbar';
import { DirectoryMenu } from './DirectoryMenu';
import {
  BrowserNode,
  BrowserPath,
  useBrowserState,
} from '../../BrowserStateContext';

export type CurrentDirectoryMenuProps = {
  path: BrowserPath;
  onSelectPath: (path: BrowserPath) => void;
};

export const CurrentDirectoryMenu = React.memo(
  ({ path, onSelectPath }: CurrentDirectoryMenuProps) => {
    const [currentPathChildren, setCurrentPathChildren] = React.useState<
      BrowserNode[]
    >([]);
    const { canEdit, onRequestChildNodes } = useBrowserState();

    React.useEffect(() => {
      const parent = path.at(-1) ?? null;
      onRequestChildNodes(parent).then(setCurrentPathChildren);
    }, [path]);

    const parentNode = path.at(-1);

    return (
      <div>
        <Toolbar>{path.map((c) => c.name).join('/') || '/'}</Toolbar>
        <DirectoryMenu
          directoryNodes={currentPathChildren.filter(canEdit)}
          parentNode={parentNode}
          onSelectParent={parentNode && (() => onSelectPath(path.slice(0, -1)))}
          onSelectDirectory={(directory: BrowserNode) => {
            onSelectPath([...path, directory]);
          }}
        />
      </div>
    );
  }
);
CurrentDirectoryMenu.displayName = 'CurrentDirectoryMenu';
