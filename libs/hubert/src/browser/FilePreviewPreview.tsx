import * as React from 'react';
import { AnimatePresence, AnimationProps, motion } from 'framer-motion';
import { Folder, FolderOpen } from '../icon';
import { useBrowserState } from './BrowserStateContext';
import { isFileNode } from './utils';
import { FileIcon } from './FileIcon';
import clsx from 'clsx';

import styles from './FilePreviewPreview.module.scss';

const AnimatedFolder = motion.create(Folder);
const AnimatedFolderOpen = motion.create(FolderOpen);
const AnimatedFileIcon = motion.create(FileIcon);

export type FilePreviewPreviewProps = {
  className?: string;
};

export const FilePreviewPreview = ({ className }: FilePreviewPreviewProps) => {
  const { currentPath, selected, getPreviewUrl, onRequestNodeIcon } =
    useBrowserState();

  const validFilePreviewUrls = React.useMemo(() => {
    return selected
      .map((s) => {
        const node = s.at(-1)!;
        const previewUrl = getPreviewUrl?.(node) ?? null;
        if (!previewUrl) {
          return null;
        }
        return [previewUrl, node] as const;
      })
      .filter((item) => item !== null)
      .slice(0, 5);
  }, [getPreviewUrl, selected]);

  const nodeIcon = React.useMemo(() => {
    if (selected.length !== 1) {
      return null;
    }

    const node = selected?.at(-1)?.at(-1);
    if (!node) {
      return null;
    }

    const customIcon = onRequestNodeIcon?.(node, {
      isSelected: false,
      isOpen: false,
      isPreview: true,
    });

    if (customIcon) {
      return customIcon;
    }

    const animationProps: AnimationProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };

    if (isFileNode(node)) {
      return (
        <AnimatedFileIcon mimeType={node.meta.mimeType} {...animationProps} />
      );
    }

    const isOpen = currentPath.some((n) => n.id === node.id);
    return isOpen ? (
      <AnimatedFolderOpen {...animationProps} />
    ) : (
      <AnimatedFolder {...animationProps} />
    );
  }, [selected, onRequestNodeIcon, currentPath]);

  return (
    <motion.div className={clsx(className, styles.root)}>
      {validFilePreviewUrls.length > 0 ? (
        <AnimatePresence>
          {validFilePreviewUrls.map(([previewUrl, node], i) => (
            <motion.img
              key={previewUrl}
              src={previewUrl}
              alt={node.name}
              data-type={
                isFileNode(node)
                  ? node.meta.mimeType.split('/')[0]
                  : 'directory'
              }
              initial={{ opacity: 0, rotate: 0, zIndex: -i }}
              animate={{
                animationDelay: `${i * 0.1}s`,
                opacity: 1,
                rotate: -3 * i,
                scale: 1 - 0.03 * (validFilePreviewUrls.length - 1) + 0.03 * i,
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>
      ) : (
        nodeIcon
      )}
    </motion.div>
  );
};
