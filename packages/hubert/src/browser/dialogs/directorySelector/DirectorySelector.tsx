import * as React from 'react';
import { CurrentDirectoryMenu } from './CurrentDirectoryMenu';
import { BrowserNode, useBrowserState } from '../../BrowserStateContext';

export interface DirectorySelectorProps {
  onSelect(node: BrowserNode): void;
}

export const DirectorySelector = React.memo<DirectorySelectorProps>(
  ({ onSelect }) => {
    const { currentPath } = useBrowserState();
    const [path, setPath] = React.useState<BrowserNode[]>(currentPath);

    React.useEffect(() => {
      const parent = path.at(-1);
      if (parent) {
        onSelect(parent);
      }
    }, [path]);

    return <CurrentDirectoryMenu path={path} onSelectPath={setPath} />;
  }
);
DirectorySelector.displayName = 'DirectoryTree';
