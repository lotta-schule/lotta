import * as React from 'react';
import {
  fixtures,
  render,
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  userEvent,
} from '../test-utils';
import {
  SearchResultNodeList,
  SearchResultNodeListProps,
} from './SearchResultNodeList';

const defaultNodes = [
  fixtures.getNode('8'),
  fixtures.getNode('12'),
  fixtures.getNode('21'),
];
const defaultNodesPaths = defaultNodes.map((n) => fixtures.getPathForNode(n));

const WrappedSearchResultsNodeList = ({
  currentSearchResults = defaultNodesPaths,
  results,
  ...props
}: TestBrowserWrapperProps & Partial<SearchResultNodeListProps>) => (
  <TestBrowserWrapper currentPath={[]} {...props}>
    <SearchResultNodeList
      results={results === undefined ? (currentSearchResults ?? []) : results}
    />
  </TestBrowserWrapper>
);

describe('NodeList component', () => {
  it('renders "Keine Ergebnisse" when nodes array is empty', () => {
    const screen = render(<WrappedSearchResultsNodeList results={[]} />);
    expect(screen.getByText('Keine Ergebnisse')).toBeVisible();
  });

  it('renders list items when nodes array is not empty', () => {
    const screen = render(<WrappedSearchResultsNodeList />);
    expect(screen.getAllByRole('option')).toHaveLength(defaultNodes.length);
  });

  describe('keyboard navigation', () => {
    describe('down arrow', () => {
      it('should keep selection when first entry is selected', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
          <WrappedSearchResultsNodeList
            selected={[defaultNodesPaths.at(-1)!]}
            onSelect={onSelect}
          />
        );

        await user.keyboard('{arrowdown}');

        expect(onSelect).not.toHaveBeenCalled();
      });

      it('should select the next item if there is one', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const screen = render(
          <WrappedSearchResultsNodeList
            selected={[defaultNodesPaths.at(-2)!]}
            onSelect={onSelect}
            onNavigate={vi.fn()}
          />
        );

        expect(
          screen.getByRole('option', { selected: true })
        ).toHaveTextContent(defaultNodes.at(-2)!.name);

        await user.keyboard('{arrowdown}');

        expect(onSelect).toHaveBeenCalledWith([defaultNodesPaths.at(-1)]);
      });
    });

    describe('keyboard up', () => {
      it('should keep selection when last entry is selected', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
          <WrappedSearchResultsNodeList
            selected={[defaultNodesPaths.at(0)!]}
            onSelect={onSelect}
            onNavigate={vi.fn()}
          />
        );

        await user.keyboard('{arrowup}');

        expect(onSelect).not.toHaveBeenCalled();
      });

      it('should not select the previous item if there is one', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const screen = render(
          <WrappedSearchResultsNodeList
            results={defaultNodesPaths}
            selected={[defaultNodesPaths.at(-2)!]}
            onSelect={onSelect}
            onNavigate={vi.fn()}
          />
        );

        expect(
          screen.getByRole('option', { selected: true })
        ).toHaveTextContent(defaultNodes.at(-2)!.name);

        await user.keyboard('{arrowup}');

        expect(onSelect).toHaveBeenCalledWith([defaultNodesPaths.at(-3)]);
      });
    });
  });
});
