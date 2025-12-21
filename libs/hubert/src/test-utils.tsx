import * as React from 'react';
import { DefaultThemes } from '@lotta-schule/theme';
import { render, type RenderOptions } from '@testing-library/react';
import { MotionConfig } from 'framer-motion';
import { HubertProvider } from './HubertProvider';
import { GlobalStyles } from './theme';
import { BrowserNode, BrowserState, NodeList } from 'browser';
import { BrowserStateContext } from 'browser/BrowserStateContext';
import * as fixtures from 'test-fixtures';

const theme = DefaultThemes.standard;

const Wrapper = ({ children }: any) => (
  <HubertProvider>
    <MotionConfig transition={{ duration: 0 }}>
      <GlobalStyles theme={theme} />
      {children}
    </MotionConfig>
  </HubertProvider>
);

const customRender = (
  ui: React.ReactElement<any>,
  renderOptions: RenderOptions = {}
): ReturnType<typeof render> =>
  render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };

export const createPromise = <T = void,>() => {
  let resolve: (value: T) => void;
  let reject: (error?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
};

// For Testing components that use the BrowserStateContext
export type TestBrowserWrapperProps = {
  children?: React.ReactNode;
  defaultNodes?: BrowserNode[];
} & Partial<Omit<BrowserState, 'onRequestChildNodes' | 'renderNodeList'>>;
export const TestBrowserWrapper = ({
  children,
  mode = 'view-and-edit',
  defaultNodes = fixtures.browserNodes,
  moveNode = vi.fn(),
  renameNode = vi.fn(),
  deleteNode = vi.fn(),
  searchNodes = vi.fn(),
  currentPath = [],
  selected = [],
  isNodeDisabled = vi.fn(() => false),
  onSelect = vi.fn(),
  onNavigate = vi.fn(),
  setCurrentAction = vi.fn(),
  currentAction = null,
  currentSearchResults = null,
  setCurrentSearchResults = vi.fn(),
  canEdit,
  uploadClient = {
    addFile: vi.fn(),
    byState: { uploading: [], pending: [], done: [], error: [] },
    hasErrors: false,
    isSuccess: false,
    isUploading: false,
    currentProgress: null,
    currentUploads: [],
  },
}: TestBrowserWrapperProps) => {
  const [nodes, setNodes] = React.useState<BrowserNode[]>(defaultNodes);
  const [isFilePreviewVisible, setIsFilePreviewVisible] = React.useState(false);

  const onRequestChildNodes = (node: BrowserNode<'directory'> | null) =>
    nodes.filter((n) => n.parent === (node?.id ?? null));

  return (
    <BrowserStateContext.Provider
      value={{
        uploadClient,
        canEdit,
        onRequestChildNodes: async (node) =>
          onRequestChildNodes(node as BrowserNode<'directory'>),
        renderNodeList: ({ path }) => (
          <NodeList path={path} nodes={onRequestChildNodes(path.at(-1)!)} />
        ),
        currentAction,
        onSelect,
        onNavigate,
        currentSearchResults,
        currentPath,
        selected,
        mode,
        isNodeDisabled,
        setCurrentAction,
        setCurrentSearchResults,
        moveNode,
        renameNode,
        deleteNode,
        searchNodes,
        isFilePreviewVisible,
        setIsFilePreviewVisible,
        createDirectory: async (parentNode, name) => {
          setNodes((nodes) => {
            return [
              ...nodes,
              {
                id: `${nodes.length + 1}`,
                name,
                type: 'directory',
                parent: parentNode?.id ?? null,
                meta: {},
              },
            ];
          });
        },
      }}
    >
      {children}
    </BrowserStateContext.Provider>
  );
};

export const waitForPosition = () => React.act(async () => {});

export { userEvent } from '@vitest/browser/context';
export * as fixtures from './test-fixtures';
