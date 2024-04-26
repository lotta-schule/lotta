import * as React from 'react';
import { Input } from '../form/input';
import { Button } from '../button';
import { CloudUpload, CreateNewFolder, Home } from '../icon';
import { useBrowserState } from './BrowserStateContext';
import clsx from 'clsx';

import styles from './Toolbar.module.scss';

export type ToolbarProps = {
  className?: string;
};

export const Toolbar = React.memo(({ className }: ToolbarProps) => {
  const { currentPath, mode, selected, createDirectory, setCurrentAction } =
    useBrowserState();

  const activeDirectoryName = React.useMemo(
    () =>
      [...currentPath].reverse().find((node) => node.type === 'directory')
        ?.name ?? <Home />,
    [selected, currentPath]
  );

  return (
    <div className={clsx(styles.root, className)} role="toolbar">
      <div className={styles.leftContainer}>{activeDirectoryName}</div>
      <div className={styles.searchField}>
        <Input placeholder="Datei suchen" />
      </div>
      <div className={styles.rightContainer}>
        {mode === 'view-and-edit' && (
          <>
            {createDirectory !== undefined && (
              <Button
                icon={<CreateNewFolder />}
                title="Ordner erstellen"
                onClick={() => {
                  setCurrentAction({
                    type: 'create-directory',
                    path: currentPath,
                  });
                }}
              />
            )}
            <Button
              icon={<CloudUpload />}
              title="Datei hochladen"
              onClick={() => alert('todo')}
            />
          </>
        )}
      </div>
    </div>
  );
});
Toolbar.displayName = 'Toolbar';
