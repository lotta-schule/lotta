import {
  render,
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  userEvent,
  waitFor,
} from 'test-utils';
import { Searchbar } from './Searchbar';

const WrappedSearchbar = ({ ...props }: TestBrowserWrapperProps) => (
  <TestBrowserWrapper {...props}>
    <Searchbar />
  </TestBrowserWrapper>
);

describe('Browser Searchbar', () => {
  it('should send a search request', async () => {
    const onSearchNodes = vi.fn().mockResolvedValue([]);
    const user = userEvent.setup();

    const screen = render(
      <WrappedSearchbar currentPath={[]} searchNodes={onSearchNodes} />
    );

    await user.fill(screen.getByRole('textbox'), 'textdatei');

    await waitFor(() => {
      expect(onSearchNodes).toHaveBeenCalledWith('textdatei');
    });
  });

  it('should close the search results when input field loses focus while not having results', async () => {
    const onSearchNodes = vi.fn().mockResolvedValue([]);
    const onSetCurrentSearchResults = vi.fn();
    const user = userEvent.setup();

    const screen = render(
      <WrappedSearchbar
        currentPath={[]}
        currentSearchResults={[]}
        searchNodes={onSearchNodes}
        setCurrentSearchResults={onSetCurrentSearchResults}
      />
    );

    await user.fill(screen.getByRole('textbox'), 'textdatei');
    await user.click(document.body); // click outside to blur

    screen.rerender(
      <WrappedSearchbar
        currentPath={[]}
        currentSearchResults={[]}
        searchNodes={onSearchNodes}
        setCurrentSearchResults={onSetCurrentSearchResults}
      />
    );

    await waitFor(() => {
      expect(onSetCurrentSearchResults).toHaveBeenCalled();
      const resultsCount =
        onSetCurrentSearchResults.mock.lastCall?.[0]?.length || 0;
      expect(resultsCount).toBe(0);
    });

    await waitFor(() => {
      expect(screen.getByRole('textbox')).not.toHaveFocus();
    });

    await waitFor(() => {
      expect(onSetCurrentSearchResults).toHaveBeenCalled();
      const resultsCount =
        onSetCurrentSearchResults.mock.lastCall?.[0]?.length || 0;
      expect(resultsCount).toBe(0);
    });
  });
});
