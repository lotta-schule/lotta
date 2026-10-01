import { Meta } from '@storybook/react-vite';
import { LinearProgress } from '@lotta-schule/hubert';

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
