import * as React from 'react';
import { Folder, FolderOpen } from '../icon';
import { isDirectoryNode } from './utils';
import { FileIcon } from './FileIcon';
import { useBrowserState } from './BrowserStateContext';
import clsx from 'clsx';

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

    if (isDirectoryNode(node)) {
      const isOpen = currentPath.some((n) => n.id === node.id);
      return isOpen ? <FolderOpen /> : <Folder />;
    }

    return (
      <FileIcon
        mimeType={node.meta.mimeType}
        style={{ fontSize: '10rem', width: '100%', height: '100%' }}
      />
    );
  }, [node, onRequestNodeIcon, currentPath]);

  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.previewSection}>
        {previewUrl ? (
          <div className={styles.previewImage}>
            <img key={previewUrl} src={previewUrl} />
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
