import * as React from 'react';
import { Meta } from '@storybook/react-vite';
import { Close, NavigationButton } from '@lotta-schule/hubert';

export default {
  title: 'Buttons/NavigationButton',
  component: NavigationButton,
  argTypes: {},
} as Meta;

export const Default = {
  args: {
    label: 'Navigation-Button',
  },
};

export const Selected = {
  args: {
    label: 'Navigation-Button selected',
    selected: true,
  },
};

export const IconButton = {
  args: {
    label: 'Navigation-Button with Icon',
    icon: <Close />,
  },
};
