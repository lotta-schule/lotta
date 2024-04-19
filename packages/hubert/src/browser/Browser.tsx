import * as React from 'react';
import { BrowserToolbar } from './BrowserToolbar';
import { BrowserFilesWindow } from './BrowserFilesWindow';
import { BrowserStatusBar } from './BrowserStatusBar';
import {
  BrowserNode,
  BrowserState,
  BrowserStateProvider,
} from './BrowserStateContext';
import { BrowserDialogs } from './BrowserDialogs';
import clsx from 'clsx';

import styles from './Browser.module.scss';

export type BrowserProps = {
  className?: string;
  nodes: BrowserNode[];
  onCreateDirectory: BrowserState['onCreateDirectory'];
};

export const Browser = React.memo(
  ({ className, nodes, onCreateDirectory, ...props }: BrowserProps) => {
    return (
      <BrowserStateProvider nodes={nodes} onCreateDirectory={onCreateDirectory}>
        <div className={clsx(className, styles.root)} {...props}>
          <BrowserToolbar />
          <BrowserFilesWindow />
          <BrowserStatusBar />
          <BrowserDialogs />
        </div>
      </BrowserStateProvider>
    );
  }
);
Browser.displayName = 'Browser';
