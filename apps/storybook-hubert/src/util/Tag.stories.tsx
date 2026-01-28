import { Meta } from '@storybook/react-vite';
import { actions } from 'storybook/actions';
import { Tag } from '@lotta-schule/hubert';

export default {
  title: 'util/Tag',
  component: Tag,
  argTypes: {
    children: {
      name: 'children',
      type: { name: 'string', required: true },
      defaultValue: 'Hallo',
      description: 'The content of the tag',
    },
  },
} as Meta;

export const Default = {
  args: {
    children: 'Hallo',
    onDelete: undefined,
  },
};

export const Deletable = {
  args: {
    children: 'Hallo',
    ...actions('onDelete'),
  },
};
