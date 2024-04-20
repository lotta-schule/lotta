import * as React from 'react';
import { useBrowserState } from './BrowserStateContext';
import clsx from 'clsx';

import styles from './FilePreview.module.scss';

export type FilePreviewProps = {
  className?: string;
};

export const FilePreview = React.memo(({ className }: FilePreviewProps) => {
  const { getPreviewUrl, selected } = useBrowserState();

  const node = React.useMemo(
    () => selected.find((node) => node.type === 'file'),
    [selected]
  );

  const previewUrl = React.useMemo(
    () => (node && getPreviewUrl?.(node)) ?? null,
    [getPreviewUrl, node]
  );

  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.previewImage}>
        {previewUrl && <img src={previewUrl} width={'100%'} />}
      </div>
      <div className={styles.infoSection}>
        Informationen Informationen Informationen Informationen Informationen
        Informationen Informationen Informationen Informationen Informationen
        Informationen Informationen Informationen Informationen Informationen
        Informationen Informationen Informationen Informationen Informationen
        Informationen Informationen Informationen Informationen Informationen
        Informationen Informationen Informationen Informationen Informationen
        Informationen
      </div>
    </div>
  );
});
FilePreview.displayName = 'FilePreview';
