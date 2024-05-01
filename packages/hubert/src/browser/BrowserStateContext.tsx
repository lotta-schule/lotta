import * as React from 'react';

export interface DefaultFileMetadata {
  mimeType: string;
  size: number;
}
export interface DefaultDirectoryMetadata extends Record<string, string> {}

export type BrowserNodeMetadata<Type extends 'file' | 'directory'> =
  Type extends 'file'
    ? DefaultFileMetadata
    : Type extends 'directory'
      ? DefaultDirectoryMetadata
      : Record<string, string>;

export type BrowserNode<
  Type extends 'directory' | 'file' = 'directory' | 'file',
> = {
  id: string;
  name: string;
  type: Type;
  parent: BrowserNode<'directory'>['id'] | null;
  meta: BrowserNodeMetadata<Type>;
};

export type BrowserMode = 'view-and-edit' | 'select' | 'select-multiple';

export type BrowserPath<T extends 'directory' | 'file' = 'directory' | 'file'> =
  BrowserNode<T>[];

export type BrowserAction =
  | { type: 'create-directory'; path: BrowserPath }
  | { type: 'move-nodes'; paths: BrowserPath[] }
  | { type: 'delete-directory'; path: BrowserPath }
  | { type: 'delete-files'; paths: BrowserPath[] }
  | { type: 'rename-node'; path: BrowserPath };

export type RenderNodeListProps = {
  path: BrowserPath<'directory'>;
};

export interface BrowserState {
  mode: BrowserMode;
  currentPath: BrowserPath<'directory'>;
  selected: BrowserNode[];
  onNavigate: (path: BrowserPath<'directory'>) => void;
  onSelect: (node: BrowserNode[]) => void;

  renderNodeList: React.ComponentType<RenderNodeListProps>;

  onRequestNodeIcon?: (node: BrowserNode) => React.ReactNode;
  onRequestChildNodes: (
    node: BrowserNode<'directory'> | null
  ) => Promise<BrowserNode[]>;

  isFilePreviewVisible: boolean;
  setIsFilePreviewVisible: (visible: boolean) => void;
  currentAction: BrowserAction | null;
  setCurrentAction: (action: BrowserAction | null) => void;

  canEdit?: (node: BrowserNode) => boolean;
  isNodeDisabled?: (node: BrowserNode) => boolean;
  getDownloadUrl?: (node: BrowserNode) => string | null | undefined;
  getPreviewUrl?: (node: BrowserNode) => string | null | undefined;
  getMetadata?: (node: BrowserNode) => Record<string, any> | null | undefined;

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
  defaultPath?: BrowserPath<'directory'>;
  onSelect?: (selected: BrowserNode[]) => void;
} & Omit<
  BrowserState,
  | 'currentPath'
  | 'onNavigate'
  | 'selected'
  | 'onSelect'
  | 'currentAction'
  | 'setCurrentAction'
  | 'isFilePreviewVisible'
  | 'setIsFilePreviewVisible'
  | 'mode'
> &
  Partial<Pick<BrowserState, 'mode'>>;

export const BrowserStateProvider = React.memo(
  ({
    children,
    mode = 'view-and-edit',
    defaultPath = [],
    onSelect,
    ...props
  }: BrowserStateProviderProps) => {
    const [currentPath, setCurrentPath] =
      React.useState<BrowserNode<'directory'>[]>(defaultPath);
    const [selected, setSelected] = React.useState<BrowserNode[]>([]);
    const [currentAction, setCurrentAction] =
      React.useState<BrowserState['currentAction']>(null);
    const [isFilePreviewVisible, setIsFilePreviewVisible] =
      React.useState<BrowserState['isFilePreviewVisible']>(false);

    React.useEffect(() => {
      onSelect?.(selected);
    }, [onSelect, selected]);

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
          isFilePreviewVisible,
          setIsFilePreviewVisible,
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
