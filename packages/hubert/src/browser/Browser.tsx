import * as React from 'react';
import { BrowserToolbar } from './BrowserToolbar';
import { BrowserFilesWindow } from './BrowserFilesWindow';
import clsx from 'clsx';

import styles from './Browser.module.scss';

export type BrowserProps = {
  className?: string;
};

export const Browser = React.memo<BrowserProps>(({ className, ...props }) => {
  return (
    <div className={clsx(className, styles.root)} {...props}>
      <BrowserToolbar />
      <BrowserFilesWindow />
    </div>
  );
});
Browser.displayName = 'Browser';
