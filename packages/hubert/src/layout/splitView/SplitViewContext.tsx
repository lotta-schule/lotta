import * as React from 'react';
import { useIsMobile } from '../../util';

export type SplitViewContextType = {
  isSidebarVisible: boolean;
  open: (options?: { force?: boolean }) => void;
  close: (options?: { force?: boolean }) => void;
  toggle: () => void;
  canOpenSidebar: boolean;
  canCloseSidebar: boolean;
};

export const SplitViewContext =
  React.createContext<SplitViewContextType | null>(null);

export type SplitViewProviderProps = {
  children: React.ReactNode;
  defaultSidebarVisible?: boolean;
  closeCondition?: () => boolean;
  openCondition?: () => boolean;
};

export const SplitViewProvider = ({
  children,
  defaultSidebarVisible,
  closeCondition = () => true,
  openCondition = () => true,
}: SplitViewProviderProps) => {
  const isMobile = useIsMobile();

  const [isSidebarActive, setIsSidebarActive] = React.useState(
    defaultSidebarVisible ?? true
  );
  const isSidebarVisible = isMobile ? isSidebarActive : true;
  const canOpenSidebar = isMobile ? !isSidebarActive && openCondition() : false;
  const canCloseSidebar = isMobile
    ? isSidebarActive && closeCondition()
    : false;
  const open = React.useCallback<SplitViewContextType['open']>(
    ({ force } = {}) => {
      if (force === true || canOpenSidebar) {
        setIsSidebarActive(true);
      }
    },
    [canOpenSidebar]
  );
  const close = React.useCallback<SplitViewContextType['close']>(
    ({ force } = {}) => {
      if (force === true || canCloseSidebar) {
        setIsSidebarActive(false);
      }
    },
    [canCloseSidebar]
  );
  const toggle = () => (isSidebarActive ? close() : open());
  return (
    <SplitViewContext.Provider
      value={{
        isSidebarVisible,
        open,
        close,
        toggle,
        canOpenSidebar,
        canCloseSidebar,
      }}
    >
      {children}
    </SplitViewContext.Provider>
  );
};

export const useSplitView = () => {
  const context = React.useContext(SplitViewContext);
  if (!context) {
    throw new Error(
      'useSplitViewContext must be used within a SplitViewProvider. Did you wrap your component in <SplitView>?'
    );
  }

  return context;
};
