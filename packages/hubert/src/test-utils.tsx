import * as React from 'react';
import { DefaultThemes } from '@lotta-schule/theme';
import { render, type RenderOptions } from '@testing-library/react';
import { MotionConfig } from 'framer-motion';
import { HubertProvider } from './HubertProvider';
import { GlobalStyles } from './theme';
import { BrowserNode, BrowserState } from 'browser';
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
} & Partial<
  Omit<BrowserState, 'onRequestChildNodes' | 'renderNodeList' | 'mode'>
>;
export const TestBrowserWrapper = ({
  children,
  defaultNodes = fixtures.browserNodes,
  moveNode = vi.fn(),
  deleteNode = vi.fn(),
  currentPath = [],
  setCurrentAction = vi.fn(),
  currentAction = null,
}: TestBrowserWrapperProps) => {
  const [nodes, setNodes] = React.useState<BrowserNode[]>(defaultNodes);
  return (
    <BrowserStateContext.Provider
      value={{
        onRequestChildNodes: async (node) =>
          nodes.filter((n) => n.parent === (node?.id ?? null)),
        renderNodeList: () => null,
        currentAction,
        onSelect: vi.fn(),
        onNavigate: vi.fn(),
        currentPath,
        selected: [],
        mode: 'view-and-edit',
        setCurrentAction,
        moveNode,
        deleteNode,
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

export * as fixtures from './test-fixtures';
