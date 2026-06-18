'use client';

import * as React from 'react';
import { Toolbar } from './Toolbar';
import { MainView } from './MainView';
import { StatusBar } from './StatusBar';
import {
  BrowserStateProvider,
  BrowserStateProviderProps,
} from './BrowserStateContext';
import { DialogsContainer } from './DialogsContainer';
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
