import * as React from 'react';
import { render, waitFor } from '../test-utils';
import { StatusBar } from './StatusBar';
import { BrowserNode, BrowserStateProvider } from './BrowserStateContext';
import userEvent from '@testing-library/user-event';

const WrappedStatusBar = ({ defaultPath }: { defaultPath?: BrowserNode[] }) => (
  <BrowserStateProvider
    renderNodeList={() => null}
    defaultPath={defaultPath}
    onRequestChildNodes={async () => []}
  >
    <StatusBar />
  </BrowserStateProvider>
);

describe('Browser/StatusBar', () => {
  it('should render correctly on home path', () => {
    const screen = render(<WrappedStatusBar />);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(
      screen.getByRole('link', { name: 'Wurzelverzeichnis' })
    ).toBeVisible();
  });

  it('should render correctly on a complex path', () => {
    const screen = render(
      <WrappedStatusBar
        defaultPath={[
          { id: '123', name: 'Test 1', type: 'directory', parent: null },
          { id: '444', name: 'Test 2', type: 'directory', parent: '123' },
          { id: '12312', name: 'Test 3', type: 'directory', parent: '444' },
        ]}
      />
    );
    expect(screen.getAllByRole('link')).toHaveLength(4); // Home + 3 directories
    expect(screen.getAllByRole('link')[1]).toHaveTextContent('Test 1');
    expect(screen.getAllByRole('link')[2]).toHaveTextContent('Test 2');
    expect(screen.getAllByRole('link')[3]).toHaveTextContent('Test 3');
  });

  it('should select a path on click', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <WrappedStatusBar
        defaultPath={[
          { id: '123', name: 'Test 1', type: 'directory', parent: null },
          { id: '444', name: 'Test 2', type: 'directory', parent: '123' },
          { id: '12312', name: 'Test 3', type: 'directory', parent: '444' },
        ]}
      />
    );
    await fireEvent.click(screen.getByRole('link', { name: 'Test 2' }));

    expect(screen.getAllByRole('link')).toHaveLength(3); // Home + 2 directories
    expect(screen.getAllByRole('link')[1]).toHaveTextContent('Test 1');
    expect(screen.getAllByRole('link')[2]).toHaveTextContent('Test 2');
  });
});
