import { render, waitFor } from '@testing-library/react';
import { DirectorySelector } from './DirectorySelector'; // Adjust the import path as necessary
import { BrowserNode, BrowserPath } from 'browser/BrowserStateContext';
import { fixtures, userEvent } from 'test-utils';

const getNodesForParent = vi.fn(
  async (parent: BrowserNode<'directory'> | null) => {
    return fixtures.browserNodes.filter(
      (n) => n.parent === (parent?.id ?? null)
    );
  }
);

const parentNode = fixtures.getNode('8');
const parentNodePath = fixtures.getPathForNode(parentNode);

describe('DirectorySelector Component', () => {
  it('renders without crashing', () => {
    const screen = render(
      <DirectorySelector
        getNodesForParent={getNodesForParent}
        value={parentNodePath}
        onChange={vi.fn()}
      />
    );
    expect(screen.container).toBeInTheDocument();
  });

  it('displays the current path', () => {
    const screen = render(
      <DirectorySelector
        getNodesForParent={getNodesForParent}
        value={parentNodePath}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('/folder 1/folder 8')).toBeInTheDocument();
  });

  it('calls getNodesForParent on render', async () => {
    render(
      <DirectorySelector
        getNodesForParent={getNodesForParent}
        value={parentNodePath}
        onChange={vi.fn()}
      />
    );
    await waitFor(() =>
      expect(getNodesForParent).toHaveBeenCalledWith(parentNode)
    );
  });

  it('renders child nodes', async () => {
    const screen = render(
      <DirectorySelector
        getNodesForParent={getNodesForParent}
        value={parentNodePath}
        onChange={vi.fn()}
      />
    );
    expect(
      await screen.findByRole('menuitem', { name: 'folder 11' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'folder 12' })
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'math' })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'folder 14' })
    ).toBeInTheDocument();
  });

  it('filters out result returning true from the filter fn', async () => {
    const filter = vi.fn(
      (nodePath: BrowserPath) => nodePath.at(-1)!.name !== 'math'
    );
    const screen = render(
      <DirectorySelector
        getNodesForParent={getNodesForParent}
        value={parentNodePath}
        onChange={vi.fn()}
        filter={filter}
      />
    );
    expect(
      await screen.findByRole('menuitem', { name: 'folder 11' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'folder 12' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'math' })).toBeNull();
    expect(
      screen.getByRole('menuitem', { name: 'folder 14' })
    ).toBeInTheDocument();
  });

  it('calls onChange with the new path when a child node is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const screen = render(
      <DirectorySelector
        getNodesForParent={getNodesForParent}
        value={parentNodePath}
        onChange={onChange}
      />
    );
    await user.click(await screen.findByText('math'));
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(fixtures.getPathForNode('13'))
    );
  });

  it('calls onChange with the parent path when the back item is clicked', async () => {
    const childNode = fixtures.getNode('13');
    const childNodePath = fixtures.getPathForNode(childNode);
    const onChange = vi.fn();
    const screen = render(
      <DirectorySelector
        getNodesForParent={getNodesForParent}
        value={childNodePath}
        onChange={onChange}
      />
    );

    (await screen.findByText('../folder 8')).click();
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(parentNodePath));
  });
});
