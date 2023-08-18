import * as React from 'react';
import { StoryObj, Meta } from '@storybook/react';
import { Label } from '../../label';
import { Input, Select } from '../../form';

export default {
  title: 'Form/Label',
  component: Label,
  argTypes: {},
  args: {
    label: 'I am a pretty label',
  },
} as Meta<typeof Label>;

export const InputLabel: StoryObj<typeof Label> = {
  render: ({ ...args }) => (
    <Label {...args}>
      <Input />
    </Label>
  ),

  name: 'Label for an Input',
};

export const SelectLabel: StoryObj<typeof Label> = {
  render: ({ ...args }) => (
    <Label {...args}>
      <Select>
        <option>Bla</option>
        <option>Blu</option>
      </Select>
    </Label>
  ),

  name: 'Label for a Select',
};

export const TextLabel: StoryObj<typeof Label> = {
  render: ({ ...args }) => (
    <Label {...args}>
      <span>Simple Text</span>
    </Label>
  ),

  name: 'Label for a Text',
};
