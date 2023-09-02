import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Select, SelectProps } from '@lotta-schule/hubert';

export default {
  title: 'Form/Select',
  component: Select,
  argTypes: {},
} as Meta;

const Template: StoryFn<Omit<SelectProps, 'ref'>> = (args) => (
  <Select {...args}>
    <optgroup label={'Gruppe 1'}>
      <option>Option 1</option>
      <option>Option 2</option>
      <option>Option 3</option>
      <option>Option 4</option>
    </optgroup>
    <optgroup label={'Gruppe 2'}>
      <option>Option 1</option>
      <option>Option 2</option>
    </optgroup>
  </Select>
);

export const Default = {
  render: Template,
  args: {},
};
