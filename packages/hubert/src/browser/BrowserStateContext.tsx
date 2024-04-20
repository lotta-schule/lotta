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
  | { type: 'move-node'; path: BrowserPath }
  | { type: 'delete-directory'; path: BrowserPath }
  | { type: 'rename-node'; path: BrowserPath };

export type RenderNodeListProps = {
  parentPath: BrowserPath;
};

export interface BrowserState {
  mode: BrowserMode;
  currentPath: BrowserPath;
  selected: BrowserNode[];
  onNavigate: (path: BrowserPath) => void;
  onSelect: (node: BrowserNode[]) => void;

  renderNodeList: React.ComponentType<RenderNodeListProps>;

  onRequestNodeIcon?: (node: BrowserNode) => React.ReactNode;
  onRequestChildNodes: (node: BrowserNode | null) => Promise<BrowserNode[]>;

  currentAction: BrowserAction | null;
  setCurrentAction: (action: BrowserAction | null) => void;

  canEdit?: (node: BrowserNode) => boolean;
  getDownloadUrl?: (node: BrowserNode) => string | null | undefined;

  createDirectory?: (
    parentNode: BrowserNode | null,
    name: string
  ) => PromiseLike<void>;
  moveNode?: (
    directoryToMove: BrowserNode,
    targetParent: BrowserNode | null
  ) => PromiseLike<void>;
  deleteNode?: (node: BrowserNode) => PromiseLike<void>;
  renameNode?: (node: BrowserNode, newName: string) => PromiseLike<void>;
}

export type BrowserStateProviderProps = {
  children: React.ReactNode;
  defaultPath?: BrowserPath;
} & Omit<
  BrowserState,
  | 'currentPath'
  | 'onNavigate'
  | 'selected'
  | 'onSelect'
  | 'currentAction'
  | 'setCurrentAction'
  | 'mode'
> &
  Partial<Pick<BrowserState, 'mode'>>;

export const BrowserStateProvider = React.memo(
  ({
    children,
    mode = 'view-and-edit',
    defaultPath = [],
    ...props
  }: BrowserStateProviderProps) => {
    const [currentPath, setCurrentPath] =
      React.useState<BrowserNode[]>(defaultPath);
    const [selected, setSelected] = React.useState<BrowserNode[]>([]);
    const [currentAction, setCurrentAction] =
      React.useState<BrowserState['currentAction']>(null);

    return (
      <BrowserStateContext.Provider
        value={{
          ...props,
          mode,
          selected,
          currentPath,
          onNavigate: setCurrentPath,
          onSelect: setSelected,
          currentAction,
          setCurrentAction,
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
  const resetAction = React.useCallback(
    () => context?.setCurrentAction(null),
    [context?.setCurrentAction]
  );
  if (!context) {
    throw new Error(
      'useBrowserState must be used within a BrowserStateContext'
    );
  }
  const enhancedContext = React.useMemo(
    () => ({
      ...context,
      resetAction,
      canEdit: context.canEdit || (() => true),
    }),
    [context, resetAction]
  );

  return enhancedContext;
};
