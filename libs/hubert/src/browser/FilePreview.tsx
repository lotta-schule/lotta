import * as React from 'react';
import { Delete, Download, Edit, OpenWith } from '../icon';
import { List, ListItem } from '../list';
import { Button } from '../button';
import { isDirectoryNode, isFileNode } from './utils';
import { BrowserPath, useBrowserState } from './BrowserStateContext';
import { FilePreviewPreview } from './FilePreviewPreview';
import { useNodeMenuProps } from './useNodeMenuProps';
import clsx from 'clsx';

import styles from './FilePreview.module.scss';

export type FilePreviewProps = {
  className?: string;
};

export const FilePreview = React.memo(({ className }: FilePreviewProps) => {
  const {
    getMetadata,
    selected,
    currentSearchResults,
    canEdit,
    mode,
    setCurrentSearchResults,
    onNavigate,
  } = useBrowserState();

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const previewSectionRef = React.useRef<HTMLDivElement>(null);

  const [maxWidth, setMaxWidth] = React.useState<number | undefined>(undefined);

  const nodePath = React.useMemo(() => {
    if (selected.length !== 1) {
      return null;
    }
    return selected.at(0) ?? null;
  }, [selected]);
  const nodePaths = React.useMemo(() => {
    if (selected.length === 1) {
      return null;
    } else {
      return selected;
    }
  }, [selected]);

  const { onAction } = useNodeMenuProps(selected);

  const meta = React.useMemo(() => {
    const node = nodePath?.at(-1);
    return node && (getMetadata?.(node) || node.meta);
  }, [nodePath]);

  React.useEffect(() => {
    if (previewSectionRef.current && wrapperRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target !== previewSectionRef.current) {
              return;
            }
            setMaxWidth(Math.floor(entry.boundingClientRect.width / 10) * 10);
          });
        },
        { root: wrapperRef.current }
      );

      observer.observe(previewSectionRef.current);
    }
  }, []);

  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.wrapper} ref={wrapperRef}>
        <div className={styles.previewSection} ref={previewSectionRef}>
          <FilePreviewPreview />
        </div>
        {nodePath && (
          <div className={styles.infoSection} style={{ maxWidth }}>
            <div className={styles.nodeNameWrapper}>
              {currentSearchResults === null && mode === 'view-and-edit' && (
                <div
                  className={styles.actionBar}
                  data-testid="FilePreviewActionBar"
                >
                  {isFileNode(nodePath.at(-1)) && (
                    <Button
                      icon={<Download />}
                      title={'herunterladen'}
                      onClick={() => onAction('download')}
                    />
                  )}
                  {canEdit(nodePath) && (
                    <Button
                      icon={<Edit />}
                      title={'umbenennen'}
                      onClick={() => onAction('rename')}
                    />
                  )}
                  {canEdit(nodePath) && (
                    <Button
                      icon={<OpenWith />}
                      title={'verschieben'}
                      onClick={() => onAction('move')}
                    />
                  )}
                  {canEdit(nodePath) && (
                    <Button
                      className={styles.deleteButton}
                      icon={<Delete />}
                      title={'löschen'}
                      onClick={() => onAction('delete')}
                    />
                  )}
                </div>
              )}
              {currentSearchResults !== null && (
                <div
                  className={clsx(
                    styles.actionBar,
                    styles.actionBarSearchShowButton
                  )}
                  data-testid="FilePreviewActionBar"
                >
                  <Button
                    onClick={() => {
                      setCurrentSearchResults(null);
                      const [path] = selected;
                      if (isDirectoryNode(path.at(-1))) {
                        onNavigate(path as BrowserPath<'directory'>);
                      } else {
                        onNavigate(
                          path.slice(0, -1) as BrowserPath<'directory'>
                        );
                      }
                    }}
                  >
                    anzeigen
                  </Button>
                </div>
              )}
              <h2>{nodePath.at(-1)!.name}</h2>
            </div>
            {meta && (
              <ul>
                {Object.entries(meta).map(([key, value]) => (
                  <li key={key}>
                    <label>{key}:</label>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {!!nodePaths?.length && (
          <div
            className={clsx(styles.infoSection, styles.manyNodes)}
            style={{ maxWidth }}
          >
            <div className={styles.nodeNameWrapper}>
              {mode === 'view-and-edit' && (
                <div
                  className={styles.actionBar}
                  data-testid="FilePreviewActionBar"
                >
                  <Button
                    icon={<OpenWith />}
                    title={'verschieben'}
                    onClick={() => onAction('move')}
                  />
                  {nodePaths.every((n) => isFileNode(n.at(-1))) && (
                    <Button
                      className={styles.deleteButton}
                      icon={<Delete />}
                      title={'löschen'}
                      onClick={() => onAction('delete')}
                    />
                  )}
                </div>
              )}
              <h2>
                {nodePaths.every(
                  (n) => n.at(-1)!.type === nodePaths.at(0)!.at(-1)!.type
                )
                  ? isFileNode(nodePaths.at(0)!.at(-1))
                    ? `${nodePaths.length} Dateien`
                    : `${nodePaths.length} Ordner`
                  : `${nodePaths.length} Dateien und Ordner`}
              </h2>
            </div>
            <List>
              {nodePaths.map((nodePath) => {
                const node = nodePath.at(-1)!;
                return (
                  <ListItem key={node.id}>
                    <span>{node.name}</span>
                  </ListItem>
                );
              })}
            </List>
          </div>
        )}
      </div>
    </div>
  );
});
FilePreview.displayName = 'FilePreview';
