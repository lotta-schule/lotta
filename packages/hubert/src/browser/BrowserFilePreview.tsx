import * as React from 'react';
import styles from './BrowserFilePreview.module.scss';

export const BrowserFilePreview = React.memo(() => {
  return (
    <div className={styles.root}>
      <div className={styles.previewImage}>
        <img src="https://via.placeholder.com/200x150.png/"></img>
      </div>
      <div className={styles.infoSection}>
        {' '}
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
BrowserFilePreview.displayName = 'BrowserFilePreview';
