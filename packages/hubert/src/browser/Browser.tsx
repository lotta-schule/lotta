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
  onRequestChildNodes: BrowserState['onRequestChildNodes'];
  onRequestNodeIcon: BrowserState['onRequestNodeIcon'];
  createDirectory?: BrowserState['createDirectory'];
  moveDirectory?: BrowserState['moveDirectory'];
  canEdit?: BrowserState['canEdit'];
};

export const Browser = React.memo(
  ({
    className,
    onRequestNodeIcon,
    onRequestChildNodes,
    createDirectory,
    moveDirectory,
    canEdit,
    ...props
  }: BrowserProps) => {
    return (
      <BrowserStateProvider
        onRequestChildNodes={onRequestChildNodes}
        onRequestNodeIcon={onRequestNodeIcon}
        canEdit={canEdit}
        createDirectory={createDirectory}
        moveDirectory={moveDirectory}
      >
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
