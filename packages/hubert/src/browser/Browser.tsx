import * as React from 'react';
import { Toolbar } from './Toolbar';
import { Explorer } from './Explorer';
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
} & Omit<BrowserStateProviderProps, 'children'>;

export const Browser = React.memo(({ className, ...props }: BrowserProps) => {
  return (
    <BrowserStateProvider {...props}>
      <div className={clsx(className, styles.root)}>
        <Toolbar />
        <Explorer />
        <StatusBar />
        <DialogsContainer />
      </div>
    </BrowserStateProvider>
  );
});
Browser.displayName = 'Browser';
