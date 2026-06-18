import * as React from 'react';
import { render, userEvent, waitFor, within } from '../test-utils';
import { Browser } from './Browser';
import { NodeList } from './NodeList';
import { BrowserNode } from './BrowserStateContext';

describe('Browser', () => {
  it('should render the Browser', async () => {
    const screen = render(
      <Browser
        className="test"
        renderNodeList={({ path }) => {
          const nodes: BrowserNode[] =
            path.length === 0
              ? [
                  {
                    id: '1',
                    name: 'test',
                    type: 'directory',
                    parent: null,
                    meta: {},
                  },
                ]
              : [];

          return <NodeList path={path} nodes={nodes} />;
        }}
        onRequestChildNodes={async () => []}
      />
    );
    expect(screen.container.querySelector('.test')).toBeInTheDocument();

    expect(screen.getByRole('toolbar')).toBeVisible();
    expect(screen.getByRole('navigation')).toBeVisible();
    expect(screen.getByRole('navigation')).toBeVisible();
  });

  it('should render the search results when search is active', async () => {
    const user = userEvent.setup();
    const screen = render(
      <Browser
        className="test"
        renderNodeList={({ path }) => <NodeList path={path} nodes={[]} />}
        onRequestChildNodes={async () => []}
        searchNodes={vi.fn().mockResolvedValue([])}
      />
    );
    await user.fill(
      within(screen.getByRole('toolbar')).getByRole('textbox'),
      'search'
    );

    await waitFor(() => {
      expect(screen.getByTestId('SearchResultNodeList')).toBeVisible();
    });
  });
});
