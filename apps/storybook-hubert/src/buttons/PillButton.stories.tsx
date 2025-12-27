import * as React from 'react';
import { Meta } from '@storybook/react-vite';
import { Close, PillButton } from '@lotta-schule/hubert';

export default {
  title: 'Buttons/PillButton',
  component: PillButton,
} as Meta;

export const Primary = {
  args: {
    icon: <Close />,
    label: '21',
  },
};
