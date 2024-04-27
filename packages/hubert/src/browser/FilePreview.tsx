import * as React from 'react';
import { AnimatePresence, AnimationProps, motion } from 'framer-motion';
import { Folder, FolderOpen } from '../icon';
import { isDirectoryNode } from './utils';
import { FileIcon } from './FileIcon';
import { useBrowserState } from './BrowserStateContext';
import clsx from 'clsx';

const AnimatedFolder = motion(Folder);
const AnimatedFolderOpen = motion(FolderOpen);
const AnimatedFileIcon = motion(FileIcon);

import styles from './FilePreview.module.scss';

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

  const node = React.useMemo(() => selected.at(-1) ?? null, [selected]);

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

  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.previewSection}>
        {previewUrl ? (
          <div className={styles.previewImage}>
            <AnimatePresence mode={'popLayout'} initial={false}>
              <motion.img
                key={previewUrl}
                src={previewUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </AnimatePresence>
          </div>
        ) : (
          nodeIcon
        )}
      </div>
      <div className={styles.infoSection}>
        {node?.name && <h2>{node.name}</h2>}
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
    </div>
  );
});
FilePreview.displayName = 'FilePreview';
