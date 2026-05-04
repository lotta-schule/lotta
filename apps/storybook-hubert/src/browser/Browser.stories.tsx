import { StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Browser, BrowserNode, NodeList } from '@lotta-schule/hubert';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const getChildNodes = (node: BrowserNode | null): BrowserNode[] => {
  const parent = node?.id ?? null;

  return browserNodes.filter((n) => n.parent === parent);
};

export default {
  title: 'browser/Default',
  component: Browser,
  args: {
    createDirectory: (parentNode, name) =>
      new Promise((resolve) => {
        action('create-directory')(parentNode, name);
        setTimeout(resolve, 500);
      }),
    moveNode: (directoryToMove, targetParent) =>
      new Promise((resolve) => {
        action('moveNode')(directoryToMove, targetParent);
        setTimeout(resolve, 500);
      }),
    deleteNode: (node) =>
      new Promise((resolve) => {
        action('deleteNode')(node);
        setTimeout(resolve, 500);
      }),
    renameNode: (node, newName) =>
      new Promise((resolve) => {
        action('renameNode')(node, newName);
        setTimeout(resolve, 500);
      }),
    getDownloadUrl: (node) =>
      node.type === 'file'
        ? `https://picsum.photos/id/${node.id}/600/400`
        : null,
    onRequestChildNodes: async (node) => {
      action('onRequestChildNodes')(node);
      return getChildNodes(node);
    },
    renderNodeList: ({ path }) => {
      const parent = path.at(-1) ?? null;
      const nodes = getChildNodes(parent);

      return <NodeList path={path} nodes={nodes} />;
    },
  },
};

export const Default: StoryObj<typeof Browser> = {
  play: async ({ canvasElement }) => {
    const user = userEvent.setup({ delay: 25 });
    const screen = within(canvasElement);

    user.click(await screen.findByRole('option', { name: 'folder 1' }));
    user.click(await screen.findByRole('option', { name: 'folder 8' }));
    user.click(await screen.findByRole('option', { name: 'ich.jpg' }));

    await waitFor(async () => {
      await expect(
        screen.getByRole('option', { name: 'ich.jpg' })
      ).toHaveAttribute('aria-selected', 'true');
    });
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Shift>}');
    await user.click(
      await screen.findByRole('option', { name: 'avatar-anime.png' })
    );
    await user.keyboard('{/Shift}');

    await expect(
      screen.getAllByRole('option', { selected: true })
    ).toHaveLength(3);

    await user.keyboard('{Control>}a{/Control}');

    await new Promise((resolve) => setTimeout(resolve, 500));

    await user.pointer({
      keys: '[MouseRight>]',
      target: screen.getByRole('option', { name: /ich\.jpg/i }),
    });
  },
};

export const Select: StoryObj<typeof Browser> = {
  args: {
    mode: 'select',
  },
  play: async ({ canvasElement }) => {
    const user = await userEvent.setup({ delay: 25 });
    const screen = within(canvasElement);

    user.click(await screen.findByRole('option', { name: 'folder 1' }));
    user.click(await screen.findByRole('option', { name: 'folder 8' }));
    user.click(await screen.findByRole('option', { name: 'ich.jpg' }));

    await waitFor(async () => {
      await expect(
        screen.getByRole('option', { name: 'ich.jpg' })
      ).toHaveAttribute('aria-selected', 'true');
    });
    await user.keyboard('{ArrowDown}');
  },
};

export const SelectMultiple: StoryObj<typeof Browser> = {
  args: {
    mode: 'select-multiple',
  },
  play: async ({ canvasElement }) => {
    const user = await userEvent.setup({ delay: 25 });
    const screen = within(canvasElement);

    user.click(await screen.findByRole('option', { name: 'folder 1' }));
    user.click(await screen.findByRole('option', { name: 'folder 8' }));
    user.click(await screen.findByLabelText(/ich\.jpg/i));

    await waitFor(async () => {
      await expect(
        screen.getByRole('checkbox', { name: /ich\.jpg/i })
      ).toBeChecked();
    });
  },
};

// eslint-disable-next-line no-var
var browserNodes = [
  {
    id: '1',
    name: 'folder 1',
    type: 'directory',
    parent: null,
    meta: {},
  },
  { id: '2', name: 'folder 2', type: 'directory', parent: null, meta: {} },
  { id: '3', name: 'folder 3', type: 'directory', parent: null, meta: {} },
  { id: '4', name: 'folder 4', type: 'directory', parent: null, meta: {} },
  { id: '5', name: 'folder 5', type: 'directory', parent: '1', meta: {} },
  { id: '6', name: 'folder 6', type: 'directory', parent: '1', meta: {} },
  { id: '7', name: 'folder 7', type: 'directory', parent: '1', meta: {} },
  { id: '8', name: 'folder 8', type: 'directory', parent: '1', meta: {} },
  { id: '9', name: 'folder 9', type: 'directory', parent: '1', meta: {} },
  { id: '10', name: 'folder 10', type: 'directory', parent: '1', meta: {} },
  { id: '11', name: 'folder 11', type: 'directory', parent: '8', meta: {} },
  { id: '12', name: 'folder 12', type: 'directory', parent: '8', meta: {} },
  { id: '13', name: 'math', type: 'directory', parent: '8', meta: {} },
  { id: '14', name: 'folder 14', type: 'directory', parent: '8', meta: {} },
  {
    id: '15',
    name: 'ich.jpg',
    type: 'file',
    parent: '8',
    meta: { mimeType: 'image/jpg', size: 1234 },
  },
  {
    id: '16',
    name: 'ich-bgblau.jpg',
    type: 'file',
    parent: '8',
    meta: { mimeType: 'image/jpg', size: 2134 },
  },
  {
    id: '17',
    name: 'avatar-ernst.webp',
    type: 'file',
    parent: '8',
    meta: { mimeType: 'image/webp', size: 512 },
  },
  {
    id: '18',
    name: 'avatar-anime.png',
    type: 'file',
    parent: '8',
    meta: { mimeType: 'image/png', size: 8539 },
  },
  {
    id: '19',
    name: 'presentation.ppt',
    type: 'file',
    parent: '13',
    meta: {
      size: 1024,
      mimeType:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    },
  },
  {
    id: '20',
    name: 'graph-one.xlsx',
    type: 'file',
    parent: '13',
    meta: {
      size: 1311234,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  },
  {
    id: '21',
    name: 'graph-two.xlsx',
    type: 'file',
    parent: '13',
    meta: {
      size: 828574,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  },
  {
    id: '22',
    name: 'notes.txt',
    type: 'file',
    parent: '13',
    meta: { size: 87, mimeType: 'text/plain' },
  },
] as const satisfies BrowserNode[];
