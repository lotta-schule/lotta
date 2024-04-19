import * as React from 'react';

export type BrowserNode = {
  id: string;
  name: string;
  type: 'directory' | 'file';
  parent: BrowserNode['id'] | null;
};

export type BrowserMode = 'view-and-edit' | 'select' | 'select-multiple';

export type BrowserPath = BrowserNode[];

export interface BrowserState {
  mode: BrowserMode;
  nodes: BrowserNode[];
  currentPath: BrowserPath;
  selected: BrowserNode[];
  onNavigate: (path: BrowserPath) => void;
  onSelect: (node: BrowserNode[]) => void;
  getNodeIcon?: (node: BrowserNode) => React.ReactNode;

  currentAction: { type: 'create-directory'; path: BrowserPath } | null;
  setCurrentAction: (action: BrowserState['currentAction']) => void;

  onCreateDirectory?: (
    parentNode: BrowserNode | null,
    name: string
  ) => PromiseLike<void>;
}

export type BrowserStateProviderProps = {
  nodes: BrowserNode[];
  mode?: BrowserMode;
  getNodeIcon?: BrowserState['getNodeIcon'];
  onCreateDirectory?: BrowserState['onCreateDirectory'];
  children: React.ReactNode;
};

export const BrowserStateProvider = React.memo(
  ({
    nodes,
    mode = 'view-and-edit',
    getNodeIcon,
    onCreateDirectory,
    children,
  }: BrowserStateProviderProps) => {
    const [currentPath, setCurrentPath] = React.useState<BrowserNode[]>([]);
    const [selected, setSelected] = React.useState<BrowserNode[]>([]);
    const [currentAction, setCurrentAction] =
      React.useState<BrowserState['currentAction']>(null);

    return (
      <BrowserStateContext.Provider
        value={{
          mode,
          nodes,
          selected,
          currentPath,
          onNavigate: setCurrentPath,
          onSelect: setSelected,
          currentAction,
          setCurrentAction,
          onCreateDirectory,
          getNodeIcon,
        }}
      >
        {children}
      </BrowserStateContext.Provider>
    );
  }
);
BrowserStateProvider.displayName = 'BrowserStateContext';

export const BrowserStateContext = React.createContext<BrowserState | null>(
  null
);

export const useBrowserState = () => {
  const context = React.useContext(BrowserStateContext);
  if (!context) {
    throw new Error(
      'useBrowserState must be used within a BrowserStateContext'
    );
  }
  return context;
};
