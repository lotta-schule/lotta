import * as React from 'react';

export type BrowserNode = {
  id: string;
  name: string;
  type: 'directory' | 'file';
  parent: BrowserNode['id'] | null;
};

export type BrowserMode = 'view-and-edit' | 'select' | 'select-multiple';

export type BrowserPath = BrowserNode[];

export type BrowserAction =
  | { type: 'create-directory'; path: BrowserPath }
  | { type: 'move-directory'; path: BrowserPath }
  | { type: 'delete-directory'; path: BrowserPath };

export interface BrowserState {
  mode: BrowserMode;
  currentPath: BrowserPath;
  selected: BrowserNode[];
  onNavigate: (path: BrowserPath) => void;
  onSelect: (node: BrowserNode[]) => void;

  onRequestNodeIcon?: (node: BrowserNode) => React.ReactNode;
  onRequestChildNodes: (node: BrowserNode | null) => Promise<BrowserNode[]>;

  currentAction: BrowserAction | null;
  setCurrentAction: (action: BrowserAction | null) => void;
  resetAction: () => void;

  canEdit: (node: BrowserNode) => boolean;

  createDirectory?: (
    parentNode: BrowserNode | null,
    name: string
  ) => PromiseLike<void>;
  moveDirectory?: (
    directoryToMove: BrowserNode,
    targetParent: BrowserNode | null
  ) => PromiseLike<void>;
  deleteNode?: (node: BrowserNode) => PromiseLike<void>;
}

export type BrowserStateProviderProps = {
  mode?: BrowserMode;
  onRequestNodeIcon?: BrowserState['onRequestNodeIcon'];
  createDirectory?: BrowserState['createDirectory'];
  moveDirectory?: BrowserState['moveDirectory'];
  deleteNode?: BrowserState['deleteNode'];
  onRequestChildNodes: BrowserState['onRequestChildNodes'];
  canEdit?: BrowserState['canEdit'];
  children: React.ReactNode;
};

export const BrowserStateProvider = React.memo(
  ({
    mode = 'view-and-edit',
    onRequestNodeIcon,
    onRequestChildNodes,
    createDirectory,
    moveDirectory,
    deleteNode,
    canEdit = () => true,
    children,
  }: BrowserStateProviderProps) => {
    const [currentPath, setCurrentPath] = React.useState<BrowserNode[]>([]);
    const [selected, setSelected] = React.useState<BrowserNode[]>([]);
    const [currentAction, setCurrentAction] =
      React.useState<BrowserState['currentAction']>(null);

    const resetAction = React.useCallback(() => setCurrentAction(null), []);

    return (
      <BrowserStateContext.Provider
        value={{
          mode,
          selected,
          currentPath,
          onNavigate: setCurrentPath,
          onSelect: setSelected,
          currentAction,
          setCurrentAction,
          resetAction,
          createDirectory,
          moveDirectory,
          deleteNode,
          onRequestNodeIcon,
          onRequestChildNodes,
          canEdit,
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
