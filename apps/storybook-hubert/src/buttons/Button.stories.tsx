import * as React from 'react';
import { Meta } from '@storybook/react-vite';
import { Button, Close } from '@lotta-schule/hubert';

export default {
  title: 'Buttons/Button',
  component: Button,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as Meta;

export const Primary = {
  args: {
    label: 'Button',
  },
};

export const IconWithLabelButton = {
  args: {
    label: 'Button with Icon',
    icon: <Close />,
  },
};

export const IconButton = {
  args: {
    icon: <Close />,
  },
};
