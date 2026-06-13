import * as React from 'react';
import {
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  fixtures,
  render,
  waitFor,
  within,
} from '../test-utils';
import { Explorer } from './Explorer';

const WrappedExplorer = ({ ...props }: TestBrowserWrapperProps) => (
  <TestBrowserWrapper {...props}>
    <Explorer />
  </TestBrowserWrapper>
);

describe('Browser/Explorer', () => {
  it('should render one level deep', async () => {
    const screen = render(<WrappedExplorer />);
    expect(screen.queryAllByRole('listbox')).toHaveLength(1);

    await waitFor(() => {
      expect(
        within(screen.queryAllByRole('listbox')[0]).getAllByRole('option')
      ).toHaveLength(
        fixtures.browserNodes.filter((n) => n.parent === null).length
      );
    });
  });

  it('should render three levels deep', async () => {
    const nodePath = fixtures.getPathForNode('13');
    const screen = render(<WrappedExplorer currentPath={nodePath} />);

    const lists = screen.queryAllByRole('listbox');

    await waitFor(() => {
      expect(lists).toHaveLength(4);
      expect(within(lists[0]).getAllByRole('option')).toHaveLength(
        fixtures.browserNodes.filter((n) => n.parent === null).length
      );
      expect(within(lists[1]).getAllByRole('option')).toHaveLength(
        fixtures.browserNodes.filter((n) => n.parent === '1').length
      );
      expect(within(lists[2]).getAllByRole('option')).toHaveLength(
        fixtures.browserNodes.filter((n) => n.parent === '8').length
      );
    });
  });
});
