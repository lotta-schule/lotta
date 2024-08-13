import {
  render,
  TestBrowserWrapper,
  TestBrowserWrapperProps,
  waitFor,
} from 'test-utils';
import { Searchbar } from './Searchbar';
import userEvent from '@testing-library/user-event';

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

    await user.type(screen.getByRole('textbox'), 'textdatei');

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

    await user.type(screen.getByRole('textbox'), 'textdatei');

    screen.rerender(
      <WrappedSearchbar
        currentPath={[]}
        currentSearchResults={[]}
        searchNodes={onSearchNodes}
        setCurrentSearchResults={onSetCurrentSearchResults}
      />
    );

    await waitFor(() => {
      expect(onSetCurrentSearchResults).toHaveBeenCalledWith([]);
    });

    await user.tab();

    expect(screen.getByRole('textbox')).not.toHaveFocus();

    await waitFor(() => {
      expect(onSetCurrentSearchResults).toHaveBeenCalledWith(null);
    });
  });
});
