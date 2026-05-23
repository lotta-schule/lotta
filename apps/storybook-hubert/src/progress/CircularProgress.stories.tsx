import { Meta } from '@storybook/react-vite';
import { CircularProgress } from '@lotta-schule/hubert';

export default {
  title: 'Progress/CircularProgress',
  component: CircularProgress,
  argTypes: {},
} as Meta;

export const Default = {
  args: {
    value: 33.3,
  },
};

export const ShowValue = {
  args: {
    value: 33.3,
    showValue: true,
  },
};

export const Indefinite = {
  args: {
    isIndeterminate: true,
  },
};
