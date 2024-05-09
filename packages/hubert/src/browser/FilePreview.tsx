import * as React from 'react';
import { AnimatePresence, AnimationProps, motion } from 'framer-motion';
import { Delete, Download, Edit, Folder, FolderOpen, OpenWith } from '../icon';
import { List, ListItem } from '../list';
import { Button } from '../button';
import { isDirectoryNode, isFileNode } from './utils';
import { FileIcon } from './FileIcon';
import { useBrowserState } from './BrowserStateContext';
import { useNodeMenuProps } from './useNodeMenuProps';
import clsx from 'clsx';

import styles from './FilePreview.module.scss';

const AnimatedFolder = motion(Folder);
const AnimatedFolderOpen = motion(FolderOpen);
const AnimatedFileIcon = motion(FileIcon);

export type FilePreviewProps = {
  className?: string;
};

export const FilePreview = React.memo(({ className }: FilePreviewProps) => {
  const {
    currentPath,
    getPreviewUrl,
    getMetadata,
    selected,
    onRequestNodeIcon,
    canEdit,
    mode,
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

  const previewUrl = React.useMemo(() => {
    const node = nodePath?.at(-1);
    return node && getPreviewUrl?.(node);
  }, [getPreviewUrl, nodePath]);

  const meta = React.useMemo(() => {
    const node = nodePath?.at(-1);
    return node && (getMetadata?.(node) || node.meta);
  }, [nodePath]);

  const nodeIcon = React.useMemo(() => {
    const node = nodePath?.at(-1);
    if (!node) {
      return null;
    }

    const customIcon = onRequestNodeIcon?.(node);

    if (customIcon) {
      return customIcon;
    }

    const animationProps: AnimationProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };

    if (isDirectoryNode(node)) {
      const isOpen = currentPath.some((n) => n.id === node.id);
      return isOpen ? (
        <AnimatedFolderOpen {...animationProps} />
      ) : (
        <AnimatedFolder {...animationProps} />
      );
    }

    return (
      <AnimatedFileIcon mimeType={node.meta.mimeType} {...animationProps} />
    );
  }, [nodePath, onRequestNodeIcon, currentPath]);

  React.useEffect(() => {
    if (previewSectionRef.current && wrapperRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target !== previewSectionRef.current) {
              return;
            }
            setMaxWidth(entry.boundingClientRect.width);
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
          {nodePath &&
            (previewUrl ? (
              <AnimatePresence mode={'popLayout'} initial={false}>
                <motion.img
                  key={previewUrl}
                  src={previewUrl}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </AnimatePresence>
            ) : (
              nodeIcon
            ))}
        </div>
        {nodePath && (
          <div className={styles.infoSection} style={{ maxWidth }}>
            <div className={styles.nodeNameWrapper}>
              {mode === 'view-and-edit' && (
                <div
                  className={styles.actionBar}
                  data-testid="FilePreviewActionBar"
                >
                  <Button
                    icon={<Download />}
                    title={'herunterladen'}
                    onClick={() => onAction('download')}
                  />
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
              <h2>{nodePath.at(-1)!.name}</h2>
            </div>
            {meta && (
              <ul>
                {Object.entries(meta).map(([key, value]) => (
                  <li key={key}>
                    <label>{key}:</label>
                    <span>
                      {['string', 'number'].includes(typeof value)
                        ? value
                        : JSON.stringify(value)}
                    </span>
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
