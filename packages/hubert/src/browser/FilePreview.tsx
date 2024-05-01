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
  } = useBrowserState();

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const previewSectionRef = React.useRef<HTMLDivElement>(null);

  const [maxWidth, setMaxWidth] = React.useState<number | undefined>(undefined);

  const node = React.useMemo(() => {
    if (selected.length !== 1) {
      return null;
    }
    return selected.at(0) ?? null;
  }, [selected]);
  const nodes = React.useMemo(() => {
    if (selected.length === 1) {
      return null;
    } else {
      return selected;
    }
  }, [selected]);

  const { onAction } = useNodeMenuProps(selected.map((n) => [n]));

  const previewUrl = React.useMemo(
    () => node && getPreviewUrl?.(node),
    [getPreviewUrl, node]
  );

  const meta = React.useMemo(
    () => node && (getMetadata?.(node) || node.meta),
    [node]
  );

  const nodeIcon = React.useMemo(() => {
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
  }, [node, onRequestNodeIcon, currentPath]);

  React.useEffect(() => {
    if (previewSectionRef.current && wrapperRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target !== previewSectionRef.current) {
              return;
            }
            console.log(entry.boundingClientRect.width);
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
          {node &&
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
        {node && (
          <div className={styles.infoSection} style={{ maxWidth }}>
            <div className={styles.nodeNameWrapper}>
              <div className={styles.actionBar}>
                <Button
                  icon={<Download />}
                  title={'herunterladen'}
                  onClick={() => onAction('download')}
                />
                <Button
                  icon={<Edit />}
                  title={'umbenennen'}
                  onClick={() => onAction('rename')}
                />
                <Button
                  icon={<OpenWith />}
                  title={'verschieben'}
                  onClick={() => onAction('move')}
                />
                <Button
                  className={styles.deleteButton}
                  icon={<Delete />}
                  title={'löschen'}
                  onClick={() => onAction('delete')}
                />
              </div>
              <h2>{node.name}</h2>
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
        {!!nodes?.length && (
          <div
            className={clsx(styles.infoSection, styles.manyNodes)}
            style={{ maxWidth }}
          >
            <div className={styles.nodeNameWrapper}>
              <div className={styles.actionBar}>
                <Button
                  icon={<OpenWith />}
                  title={'verschieben'}
                  onClick={() => onAction('move')}
                />
                {nodes.every((n) => isFileNode(n)) && (
                  <Button
                    className={styles.deleteButton}
                    icon={<Delete />}
                    title={'löschen'}
                    onClick={() => onAction('delete')}
                  />
                )}
              </div>
              <h2>
                {nodes.every((n) => n.type === nodes.at(0)!.type)
                  ? isFileNode(nodes.at(0)!)
                    ? `${nodes.length} Dateien`
                    : `${nodes.length} Ordner`
                  : `${nodes.length} Dateien und Ordner`}
              </h2>
            </div>
            <List>
              {nodes.map((node) => (
                <ListItem key={node.id}>
                  <span>{node.name}</span>
                </ListItem>
              ))}
            </List>
          </div>
        )}
      </div>
    </div>
  );
});
FilePreview.displayName = 'FilePreview';
