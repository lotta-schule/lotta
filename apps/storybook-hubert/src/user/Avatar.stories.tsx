import { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '@lotta-schule/hubert';

export default {
  title: 'User/Avatar',
  component: Avatar,
  argTypes: {},
} as Meta<typeof Avatar>;

export const Default: StoryObj<typeof Avatar> = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rosa-luxemburg',
    title: 'Rosa Luxemburg',
  },
};
