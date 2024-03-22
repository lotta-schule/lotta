import * as React from 'react';
import {
  SplitViewContextType,
  SplitViewProvider,
  SplitViewProviderProps,
  useSplitView,
} from './SplitViewContext';
import { useElementFullWindowHeight } from '../../util';
import clsx from 'clsx';

import styles from './SplitView.module.scss';

export type SplitViewProps = Omit<
  React.HTMLProps<HTMLDivElement>,
  'children'
> & {
  children:
    | React.ReactNode
    | Iterable<React.ReactNode>
    | ((
        props: SplitViewContextType
      ) => React.ReactNode | Iterable<React.ReactNode>);
} & Omit<SplitViewProviderProps, 'children'>;

export const SPLITVIEW_CLASS = 'hubert-splitview-component';

const SplitViewChildren = ({ children }: Pick<SplitViewProps, 'children'>) => {
  const props = useSplitView();

  if (typeof children === 'function') {
    return children(props);
  }

  return children;
};

/**
 * A component that provides a split view layout.
 * On small screens, the sidebar is hidden by default and can be toggled by the user.
 * On larger screens, the sidebar is always visible.
 **/
export const SplitView = ({
  children,
  className,
  openCondition,
  closeCondition,
  defaultSidebarVisible,
  ...props
}: SplitViewProps) => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const height = useElementFullWindowHeight(elementRef);
  return (
    <SplitViewProvider
      openCondition={openCondition}
      closeCondition={closeCondition}
      defaultSidebarVisible={defaultSidebarVisible}
    >
      <div
        {...props}
        ref={elementRef}
        style={{ height: height || undefined }}
        className={clsx(SPLITVIEW_CLASS, className, styles.root)}
      >
        <SplitViewChildren>{children}</SplitViewChildren>
      </div>
    </SplitViewProvider>
  );
};
