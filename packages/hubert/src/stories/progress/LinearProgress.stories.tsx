import { Meta } from '@storybook/react';
import { LinearProgress } from '../../progress';

export default {
  title: 'Progress/LinearProgress',
  component: LinearProgress,
  argTypes: {},
} as Meta;

export const Default = {
  args: {
    value: 33.3,
  },
};

export const Indefinite = {
  args: {
    isIndeterminate: true,
  },
};
