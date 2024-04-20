import * as React from 'react';

import styles from './FilePreview.module.scss';

export const FilePreview = React.memo(() => {
  return (
    <div className={styles.root}>
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
