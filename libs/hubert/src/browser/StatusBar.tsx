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
  const [childDirectoriesCount, setChildDirectoriesCount] = React.useState(0);
  const [childFilesCount, setChildFilesCount] = React.useState(0);
  const {
    currentPath,
    selected,
    currentSearchResults,
    onNavigate,
    onRequestChildNodes,
    onSelect,
    setCurrentSearchResults,
  } = useBrowserState();

  const onClickLink = React.useCallback(
    (path: BrowserPath<'directory'>) => (e: React.MouseEvent) => {
      e.preventDefault();
      setCurrentSearchResults(null);
      if (currentPath !== path) {
        onNavigate(path);
        onSelect(path.length ? [path] : []);
      }
    },
    [onNavigate]
  );

  const searchDirectoriesCount = React.useMemo(
    () => currentSearchResults?.filter((r) => isDirectoryNode(r.at(-1))).length,
    [currentSearchResults]
  );
  const searchFilesCount = React.useMemo(
    () => currentSearchResults?.filter((r) => isFileNode(r.at(-1))).length,
    [currentSearchResults]
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
        <a href="#" title="Wurzelverzeichnis" onClick={onClickLink([])}>
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
        {selected.length === 1 && isFileNode(selected.at(-1)?.at(-1)) && (
          <span className={styles.pathComponent}>
            &nbsp;/&nbsp;{selected.at(-1)!.at(-1)!.name}
          </span>
        )}
      </div>
      {currentSearchResults === null &&
      (childDirectoriesCount || childFilesCount) ? (
        <div className={styles.currentCount}>
          {!!childDirectoriesCount && (
            <span>Ordner: {childDirectoriesCount}</span>
          )}
          {!!childFilesCount && <span>Dateien: {childFilesCount}</span>}
        </div>
      ) : null}

      {currentSearchResults?.length && (
        <div className={styles.currentCount}>
          {!!searchDirectoriesCount && (
            <span>Ordner: {searchDirectoriesCount}</span>
          )}
          {!!searchFilesCount && <span>Dateien: {searchFilesCount}</span>}
        </div>
      )}
    </div>
  );
});
StatusBar.displayName = 'StatusBar';
