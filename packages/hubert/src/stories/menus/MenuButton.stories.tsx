import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { MenuButton, Item } from '../../menu';
import { action } from '@storybook/addon-actions';
import { Close, ChevronRight } from '../../icon';

export default {
  title: 'menus/MenuButton',
  component: MenuButton,
  subcomponents: {
    Item,
  },
} as Meta;

const Template: StoryFn = (args: any) => (
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
);

export const Default = {
  render: Template,

  args: {
    buttonProps: {
      label: 'Open the menu',
    },
    title: 'Chose a MenuItem number',
    onAction: action('onAction'),
    onClose: action('onClose'),
    onOpenChange: action('onOpenChange'),
  },
};
