import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react-vite';
import { Message, ErrorMessage, SuccessMessage } from '@lotta-schule/hubert';

export default {
  title: 'util/Message',
  component: Message,
} as Meta;

const ErrorTemplate: StoryFn = (args: any) => <ErrorMessage {...args} />;
const SuccessTemplate: StoryFn = (args: any) => <SuccessMessage {...args} />;

export const Default = {
  args: {
    message: 'Hallo',
    color: '#ccc',
  },
};

export const Empty = {
  args: {
    message: '',
    color: '#ccc',
  },
};

export const ErrorMsg = {
  render: ErrorTemplate,

  args: {
    error: new Error('Upsi'),
  },
};

export const SuccessMsg = {
  render: SuccessTemplate,

  args: {
    message: 'Glückwunsch',
  },
};
