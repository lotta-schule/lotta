import * as React from 'react';
import { StoryObj, Meta } from '@storybook/react';
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
    src: 'https://avatars.dicebear.com/api/avataaars/rosa-luxemburg.svg',
  },
  {
    title: 'Karl Liebknecht',
    src: 'https://avatars.dicebear.com/api/avataaars/karl-liebknecht.svg',
  },
  {
    title: 'Clara Zetkin',
    src: 'https://avatars.dicebear.com/api/avataaars/clara-zetkin.svg',
  },
  {
    title: 'Kurt Eisner',
    src: 'https://avatars.dicebear.com/api/avataaars/kurt-eisner.svg',
  },
  {
    title: 'Karl Kautsky',
    src: 'https://avatars.dicebear.com/api/avataaars/karl-kautsky.svg',
  },
  {
    title: 'August Bebel',
    src: 'https://avatars.dicebear.com/api/avataaars/august-bebel.svg',
  },
  {
    title: 'Nadezhda Krupskaya',
    src: 'https://avatars.dicebear.com/api/avataaars/nadezhda-krupskaya.svg',
  },
  {
    title: 'Noam Chomsky',
    src: 'https://avatars.dicebear.com/api/avataaars/noam-chomsky.svg',
  },
  {
    title: 'George Orwell',
    src: 'https://avatars.dicebear.com/api/avataaars/george-orwell.svg',
  },
];
