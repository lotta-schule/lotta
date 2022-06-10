import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Menu } from 'shared/general/menu/Menu';
import { MenuList, MenuItem } from 'shared/general/menu/MenuList';

export default {
    title: 'util/Menu',
    component: Menu,
} as Meta;

const Template: Story = (args: any) => <Menu {...args} />;

export const Default = Template.bind({});
Default.args = {
    buttonProps: {
        label: 'Click',
    },
    children: (
        <MenuList>
            <MenuItem href={'#'}>MenuItem 1</MenuItem>
            <MenuItem href={'#'}>MenuItem 2</MenuItem>
            <MenuItem isDivider />
            <MenuItem href={'#'}>MenuItem 3</MenuItem>
            <MenuItem href={'#'}>MenuItem 4</MenuItem>
            <MenuItem href={'#'}>MenuItem 5</MenuItem>
        </MenuList>
    ),
};
