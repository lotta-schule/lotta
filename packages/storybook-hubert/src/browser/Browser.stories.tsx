import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Browser } from '@lotta-schule/hubert';

const meta: Meta<typeof Browser> = {
  title: 'browser/Default',
  component: Browser,
  args: {
    createDirectory: (parentNode, name) =>
      new Promise((resolve) => {
        action('create-directory')(parentNode, name);
        setTimeout(resolve, 500);
      }),
    moveDirectory: (directoryToMove, targetParent) =>
      new Promise((resolve) => {
        action('move-directory')(directoryToMove, targetParent);
        setTimeout(resolve, 500);
      }),
    onRequestChildNodes: async (node) => {
      if (!node?.id) {
        return [
          {
            id: '1',
            name: 'folder 1',
            type: 'directory',
            parent: null,
          },
          { id: '2', name: 'folder 2', type: 'directory', parent: null },
          { id: '3', name: 'folder 3', type: 'directory', parent: null },
          { id: '4', name: 'folder 4', type: 'directory', parent: null },
        ];
      }

      if (node.id === '1') {
        return [
          { id: '5', name: 'folder 5', type: 'directory', parent: '1' },
          { id: '6', name: 'folder 6', type: 'directory', parent: '1' },
          { id: '7', name: 'folder 7', type: 'directory', parent: '1' },
          { id: '8', name: 'folder 8', type: 'directory', parent: '1' },
          { id: '9', name: 'folder 9', type: 'directory', parent: '1' },
          { id: '10', name: 'folder 10', type: 'directory', parent: '1' },
        ];
      }

      if (node.id === '8') {
        return [
          { id: '11', name: 'folder 11', type: 'directory', parent: '8' },
          { id: '12', name: 'folder 12', type: 'directory', parent: '8' },
          { id: '13', name: 'folder 13', type: 'directory', parent: '8' },
          { id: '14', name: 'folder 14', type: 'directory', parent: '8' },
          { id: '15', name: 'folder 15', type: 'file', parent: '8' },
          { id: '16', name: 'folder 16', type: 'file', parent: '8' },
          { id: '17', name: 'folder 17', type: 'file', parent: '8' },
          { id: '18', name: 'folder 18', type: 'file', parent: '8' },
        ];
      }

      return [];
    },
  },
} as Meta;

export default meta;

export const Default: StoryObj<typeof Browser> = {};
