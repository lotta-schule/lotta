import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Option, Select, SelectProps } from '@lotta-schule/hubert';

export default {
  title: 'Form/Select',
  component: Select,
  argTypes: {
  },
} as Meta;

const Template: StoryFn<Omit<SelectProps, 'ref'>> = (args) => (
  <Select {...args}>
    <Option key={'option1'} value={'1'}>Option 1</Option>
    <Option key={'option2'} value={'2'}>Option 2</Option>
    <Option key={'option3'} value={'3'}>Option 3</Option>
    <Option key={'option4'} value={'4'}>Option 4</Option>
  </Select>
);

export const Default = {
  render: Template,
  args: {
    title: 'Example Select',
    onChange: action('onChange'),
    value: '1'
  },
};
