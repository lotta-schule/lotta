import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react-vite';
import { Item, Menu } from '@lotta-schule/hubert';
import { fn } from 'storybook/test';

export default {
  title: 'menus/Menu',
  component: Menu,
  subcomponents: {
    Item,
  },
} as Meta;

const Template: StoryFn = (args: any) => (
  <Menu {...args}>
    <Item key={'Menuitem 1'}>MenuItem 1</Item>
    <Item key={'Menuitem 2'}>MenuItem 2</Item>
    <Item key={'Menuitem 3'}>MenuItem 3</Item>
    <Item key={'Menuitem 4'}>MenuItem 4</Item>
    <Item key={'Menuitem 5'}>MenuItem 5</Item>
  </Menu>
);

export const Default = {
  render: Template,

  args: {
    title: 'Chose a MenuItem number',
    onAction: fn(),
    onClose: undefined,
  },
};
