import * as React from 'react';
import { BrowserToolbar } from './BrowserToolbar';
import { BrowserFilesWindow } from './BrowserFilesWindow';
import { BrowserStatusBar } from './BrowserStatusBar';
import {
  BrowserStateProvider,
  BrowserStateProviderProps,
} from './BrowserStateContext';
import { BrowserDialogs } from './BrowserDialogs';
import clsx from 'clsx';

import styles from './Browser.module.scss';

export type BrowserProps = {
  className?: string;
} & Omit<BrowserStateProviderProps, 'children'>;

export const Browser = React.memo(({ className, ...props }: BrowserProps) => {
  return (
    <BrowserStateProvider {...props}>
      <div className={clsx(className, styles.root)}>
        <BrowserToolbar />
        <BrowserFilesWindow />
        <BrowserStatusBar />
        <BrowserDialogs />
      </div>
    </BrowserStateProvider>
  );
});
Browser.displayName = 'Browser';
