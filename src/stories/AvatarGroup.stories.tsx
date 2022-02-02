import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { Avatar, AvatarProps } from '../shared/general/avatar/Avatar';
import {
    AvatarGroup,
    AvatarGroupProps,
} from '../shared/general/avatar/AvatarGroup';

export default {
    title: 'user/AvatarGroup',
    component: AvatarGroup,
    argTypes: {
        // backgroundColor: { control: 'color' },
    },
} as Meta;

const getRandomAvatarUrl = () =>
    `https://avatars.dicebear.com/api/avataaars/${Math.floor(
        Math.random() * 1000
    )}.svg`;

const Template: Story<AvatarProps> = (args) => (
    <AvatarGroup {...args}>
        <Avatar src={getRandomAvatarUrl()} />
        <Avatar src={getRandomAvatarUrl()} />
        <Avatar src={getRandomAvatarUrl()} />
        <Avatar src={getRandomAvatarUrl()} />
        <Avatar src={getRandomAvatarUrl()} />
        <Avatar src={getRandomAvatarUrl()} />
    </AvatarGroup>
);

export const Lotta = Template.bind({});
Lotta.args = {
    src: getRandomAvatarUrl(),
    title: 'Rosa Luxemburg',
};
