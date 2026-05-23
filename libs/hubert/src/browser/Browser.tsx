'use client';

import * as React from 'react';
import { Toolbar } from './Toolbar.js';
import { MainView } from './MainView.js';
import { StatusBar } from './StatusBar.js';
import {
  BrowserStateProvider,
  BrowserStateProviderProps,
} from './BrowserStateContext.js';
import { DialogsContainer } from './DialogsContainer.js';
import clsx from 'clsx';

import styles from './Browser.module.scss';

export type BrowserProps = {
  className?: string;
  style?: React.CSSProperties;
} & Omit<BrowserStateProviderProps, 'children'>;

export const Browser = React.memo(
  ({ className, style, ...props }: BrowserProps) => {
    return (
      <BrowserStateProvider {...props}>
        <div style={style} className={clsx(className, styles.root)}>
          <Toolbar className={styles.toolbar} />
          <MainView className={styles.mainView} />
          <StatusBar className={styles.statusBar} />
          <DialogsContainer />
        </div>
      </BrowserStateProvider>
    );
  }
);
Browser.displayName = 'Browser';
