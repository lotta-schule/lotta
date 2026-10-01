import * as React from 'react';
import { StoryObj } from '@storybook/react-vite';
import { Close, ChevronRight, MenuButton, Item } from '@lotta-schule/hubert';
import { fn } from 'storybook/test';

export default {
  title: 'menus/MenuButton',
  component: MenuButton,
  subcomponents: {
    Item: Item as React.FunctionComponent<any>,
  },
  render: (args: any) => (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MenuButton {...args}>
        <Item key={'Menuitem 1'}>
          <Close /> MenuItem 1
        </Item>
        <Item key={'Menuitem 2'}>
          <ChevronRight />
          MenuItem 1
        </Item>
        <Item key={'Menuitem 3'}>MenuItem 3</Item>
        <Item key={'Menuitem 4'}>MenuItem 4</Item>
        <Item key={'Menuitem 5'}>MenuItem 5</Item>
      </MenuButton>
    </div>
  ),
};

type Story = StoryObj<typeof MenuButton>;

export const Default: Story = {
  args: {
    buttonProps: {
      label: 'Open the menu',
    },
    title: 'Chose a MenuItem number',
    onAction: fn(),
    onOpenChange: fn(),
  },
};
