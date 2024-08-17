import * as React from 'react';
import { Upload, useUploadClient } from './upload/useUploadClient';

export interface DefaultFileMetadata {
  mimeType: string;
  size: number;
}
export interface DefaultDirectoryMetadata extends Record<string, any> {}

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
  | { type: 'create-directory'; path: BrowserPath<'directory'> }
  | { type: 'move-nodes'; paths: BrowserPath[] }
  | { type: 'delete-directory'; path: BrowserPath<'directory'> }
  | { type: 'delete-files'; paths: BrowserPath[] }
  | { type: 'rename-node'; path: BrowserPath };

export type RenderNodeListProps = {
  path: BrowserPath<'directory'>;
};

export interface BrowserState {
  mode: BrowserMode;
  currentPath: BrowserPath<'directory'>;
  selected: BrowserPath[];
  onNavigate: (path: BrowserPath<'directory'>) => void;
  onSelect: (node: BrowserPath[]) => void;

  renderNodeList: React.ComponentType<RenderNodeListProps>;

  onRequestNodeIcon?: (
    node: BrowserNode,
    state: { isSelected: boolean; isOpen?: boolean; isPreview: boolean }
  ) => React.ReactNode;
  onRequestChildNodes: (
    node: BrowserNode<'directory'> | null,
    options?: { refetch?: boolean }
  ) => Promise<BrowserNode[]>;

  isFilePreviewVisible: boolean;
  setIsFilePreviewVisible: (visible: boolean) => void;
  currentAction: BrowserAction | null;
  setCurrentAction: (action: BrowserAction | null) => void;
  currentSearchResults: null | BrowserPath[];
  setCurrentSearchResults: (results: null | BrowserPath[]) => void;

  canEdit?: (node: BrowserPath) => boolean;
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
  uploadNode?: (
    upload: Upload,
    parentNode: BrowserNode<'directory'>,
    update: (updater: (update: Upload) => Partial<Upload>) => void
  ) => void;
  searchNodes?: (term: string) => PromiseLike<BrowserPath[]>;

  uploadClient?: ReturnType<typeof useUploadClient>;
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
  | 'currentSearchResults'
  | 'setCurrentSearchResults'
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
    const [selected, setSelected] = React.useState<BrowserPath[]>([]);
    const [currentAction, setCurrentAction] =
      React.useState<BrowserState['currentAction']>(null);
    const [isFilePreviewVisible, setIsFilePreviewVisible] =
      React.useState<BrowserState['isFilePreviewVisible']>(false);
    const uploadClient = useUploadClient(props.uploadNode);
    const [currentSearchResults, setCurrentSearchResults] =
      React.useState<BrowserState['currentSearchResults']>(null);

    React.useEffect(() => {
      onSelect?.(selected.map((n) => n.at(-1)!));
    }, [onSelect, selected]);

    React.useEffect(() => {
      if (currentSearchResults) {
        setSelected([]);
      } else {
        setIsFilePreviewVisible(false);
      }
    }, [currentSearchResults]);

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
          currentSearchResults,
          setCurrentSearchResults,
          uploadClient,
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
