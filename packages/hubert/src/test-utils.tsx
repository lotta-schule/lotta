import * as React from 'react';
import { DefaultThemes } from '@lotta-schule/theme';
import { render, RenderOptions } from '@testing-library/react';
import { MotionConfig } from 'framer-motion';
import { HubertProvider } from './HubertProvider';
import { GlobalStyles } from './theme';

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
  ui: React.ReactElement,
  renderOptions: Omit<RenderOptions, 'wrapper'> = {}
) =>
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
