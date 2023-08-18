import * as React from 'react';
import { ID } from 'model';
import { SelectedDirectoryContextProvider } from './SelectedDirectoryContext';
import { CurrentDirectoryMenu } from './CurrentDirectoryMenu';
import fileExplorerContext from '../context/FileExplorerContext';

export interface DirectorySelectorProps {
  onSelectDirectoryId(directoryId: ID | null): void;
}

export const DirectorySelector = React.memo<DirectorySelectorProps>(
  ({ onSelectDirectoryId }) => {
    const [{ currentPath }] = React.useContext(fileExplorerContext);

    return (
      <SelectedDirectoryContextProvider
        defaultPath={currentPath}
        onSelectDirectoryId={onSelectDirectoryId}
      >
        <CurrentDirectoryMenu />
      </SelectedDirectoryContextProvider>
    );
  }
);
DirectorySelector.displayName = 'DirectoryTree';
