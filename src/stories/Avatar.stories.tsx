import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { Avatar, AvatarProps } from '../component/general/avatar/Avatar';

export default {
  title: 'Example/Avatar',
  component: Avatar,
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
} as Meta;

const Template: Story<AvatarProps> = (args) => <Avatar {...args} />;

export const Lotta = Template.bind({});
Lotta.args = {
  src: 'https://www.flaticon.com/svg/static/icons/svg/3870/3870479.svg'
};
