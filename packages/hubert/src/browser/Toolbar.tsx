import * as React from 'react';
import { Input } from '../form/input';
import { Button } from '../button';
import { CloudUpload, CreateNewFolder } from '../icon';
import { useBrowserState } from './BrowserStateContext';

import styles from './Toolbar.module.scss';

export const Toolbar = React.memo(() => {
  const { setCurrentAction, currentPath, createDirectory } = useBrowserState();
  return (
    <div className={styles.root}>
      <div className={styles.leftContainer}>file name</div>
      <div className={styles.searchField}>
        <Input placeholder="Datei suchen" />
      </div>
      <div className={styles.rightContainer}>
        {createDirectory !== undefined && (
          <Button
            icon={<CreateNewFolder />}
            title="Ordner erstellen"
            onClick={() => {
              setCurrentAction({ type: 'create-directory', path: currentPath });
            }}
          />
        )}
        <Button
          icon={<CloudUpload />}
          title="Datei hochladen"
          onClick={() => alert('todo')}
        />
      </div>
    </div>
  );
});
Toolbar.displayName = 'Toolbar';
