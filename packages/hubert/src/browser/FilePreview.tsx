import * as React from 'react';
import { useBrowserState } from './BrowserStateContext';
import clsx from 'clsx';

import styles from './FilePreview.module.scss';

export type FilePreviewProps = {
  className?: string;
};

export const FilePreview = React.memo(({ className }: FilePreviewProps) => {
  const { getPreviewUrl, getMetadata, selected } = useBrowserState();

  const node = React.useMemo(
    () => selected.find((node) => node.type === 'file'),
    [selected]
  );

  const previewUrl = React.useMemo(
    () => (node && getPreviewUrl?.(node)) ?? null,
    [getPreviewUrl, node]
  );

  const meta = React.useMemo(
    () => node && (getMetadata?.(node) || node.meta),
    [node]
  );

  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.previewSection}>
        {previewUrl && (
          <div className={styles.previewImage}>
            <img key={previewUrl} src={previewUrl} />
          </div>
        )}
      </div>
      {meta && (
        <div className={styles.infoSection}>
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
        </div>
      )}
    </div>
  );
});
FilePreview.displayName = 'FilePreview';
