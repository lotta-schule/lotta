import * as React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { Option, Select } from '@lotta-schule/hubert';

export default {
  title: 'Form/Select',
  component: Select,
  subcomponents: { Option: Option as any },
  args: {
    title: 'Example Select',
    onChange: action('onChange'),
    value: '1',
    children: [
      <Option key={'option1'} value={'1'}>
        Option 1
      </Option>,
      <Option key={'option2'} value={'2'}>
        Option 2
      </Option>,
      <Option key={'option3'} value={'3'}>
        Option 3
      </Option>,
      <Option key={'option4'} value={'4'}>
        Option 4
      </Option>,
    ],
  },

  argTypes: {},
} as Meta<typeof Select>;

export const Default: StoryObj<typeof Select> = {};
