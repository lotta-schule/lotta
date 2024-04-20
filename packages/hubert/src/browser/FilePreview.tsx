import * as React from 'react';
import clsx from 'clsx';

import styles from './FilePreview.module.scss';

export type FilePreviewProps = {
  className?: string;
};

export const FilePreview = React.memo(({ className }: FilePreviewProps) => {
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.previewImage}>
        <img src="https://via.placeholder.com/200x150.png/"></img>
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
