import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { LoadingButton, LoadingButtonProps } from '../../button';

export default {
  title: 'Buttons/LoadingButton',
  component: LoadingButton,
  argTypes: {},
} as Meta;

const Template: Story<Omit<LoadingButtonProps, 'ref'>> = (args) => (
  <LoadingButton {...args} />
);

export const Default = Template.bind({});
Default.args = {
  label: 'save',
  loading: true,
};
