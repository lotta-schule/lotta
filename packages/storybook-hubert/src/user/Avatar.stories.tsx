import { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '@lotta-schule/hubert';

export default {
  title: 'User/Avatar',
  component: Avatar,
  argTypes: {},
} as Meta<typeof Avatar>;

export const Default: StoryObj<typeof Avatar> = {
  args: {
    src: 'https://avatars.dicebear.com/api/avataaars/rosa-luxemburg.svg',
    title: 'Rosa Luxemburg',
  },
};
