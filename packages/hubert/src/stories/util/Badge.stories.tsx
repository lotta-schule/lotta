import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { Badge } from '../../badge';

export default {
  title: 'util/Badge',
  Component: Badge,
  argTypes: {},
} as Meta;

const Template: StoryFn = (args) => <Badge {...args} />;

export const Default = {
  render: Template,

  args: {
    value: 12,
  },
};
