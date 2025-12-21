import * as React from 'react';
import { StoryObj, Meta } from '@storybook/react-vite';
import { Avatar, AvatarGroup, AvatarProps } from '@lotta-schule/hubert';

export default {
  title: 'user/AvatarGroup',
  component: AvatarGroup,
} as Meta<typeof AvatarGroup>;

export const Default: StoryObj<typeof AvatarGroup> = {
  render: (args) => (
    <AvatarGroup {...args}>
      {avatars.map(({ title, src }) => (
        <Avatar key={title} title={title} src={src} />
      ))}
    </AvatarGroup>
  ),

  args: {
    max: 3,
  },
};

const avatars: AvatarProps[] = [
  {
    title: 'Rosa Luxemburg',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rosa-luxemburg',
  },
  {
    title: 'Karl Liebknecht',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karl-liebknecht',
  },
  {
    title: 'Clara Zetkin',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=clara-zetkin',
  },
  {
    title: 'Kurt Eisner',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kurt-eisner',
  },
  {
    title: 'Karl Kautsky',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karl-kautsky',
  },
  {
    title: 'August Bebel',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=august-bebel',
  },
  {
    title: 'Nadezhda Krupskaya',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nadezhda-krupskaya',
  },
  {
    title: 'Noam Chomsky',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noam-chomsky',
  },
  {
    title: 'George Orwell',
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=george-orwell',
  },
];
