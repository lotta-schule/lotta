import * as React from 'react';
import { Home } from '../icon';
import { BrowserPath, useBrowserState } from './BrowserStateContext';
import { isDirectoryNode, isFileNode } from './utils';
import clsx from 'clsx';

import styles from './StatusBar.module.scss';

export type StatusBarProps = {
  className?: string;
};

export const StatusBar = React.memo(({ className }: StatusBarProps) => {
  const [childDirectoriesCount, setChildDirectoriesCount] =
    React.useState<number>(0);
  const [childFilesCount, setChildFilesCount] = React.useState<number>(0);
  const { currentPath, selected, onNavigate, onRequestChildNodes } =
    useBrowserState();
  const onClickLink = React.useCallback(
    (path: BrowserPath<'directory'>) => (e: React.MouseEvent) => {
      e.preventDefault();
      onNavigate(path);
    },
    [onNavigate]
  );

  React.useEffect(() => {
    onRequestChildNodes(currentPath.at(-1) ?? null).then((childNodes) => {
      setChildDirectoriesCount(childNodes.filter(isDirectoryNode).length);
      setChildFilesCount(childNodes.filter(isFileNode).length);
    });
  }, [onRequestChildNodes, currentPath]);

  return (
    <div className={clsx(styles.root, className)} role="navigation">
      <div className={styles.currentPath}>
        <a
          href="#"
          title="Wurzelverzeichnis"
          onClick={(e) => {
            e.preventDefault();
            onNavigate([]);
          }}
        >
          <Home />
        </a>
        {currentPath.map((node, i) => (
          <React.Fragment key={node.id}>
            <span className={styles.separator}>/</span>
            <a
              className={styles.pathComponent}
              href={'#'}
              key={node.id}
              onClick={onClickLink(currentPath.slice(0, i + 1))}
            >
              {node.name}
            </a>
          </React.Fragment>
        ))}
        {selected.length === 1 && (
          <span className={styles.pathComponent}>
            &nbsp;/&nbsp;{selected[0].name}
          </span>
        )}
      </div>
      {childDirectoriesCount || childFilesCount ? (
        <div className={styles.currentCount}>
          {!!childDirectoriesCount && (
            <span>Ordner: {childDirectoriesCount}</span>
          )}
          {!!childFilesCount && <span>Dateien: {childFilesCount}</span>}
        </div>
      ) : null}
    </div>
  );
});
StatusBar.displayName = 'StatusBar';
