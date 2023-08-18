import * as React from 'react';
import { Meta } from '@storybook/react';
import { Box } from '../../layout';

export default {
  title: 'Layout/Box',
  component: Box,
  argTypes: {},
} as Meta;

export const Default = {
  args: {
    children: (
      <div>
        <img src="https://picsum.photos/id/3/300/200" alt="" />
        <div>Ich bin eine Box mit Inhalt</div>
      </div>
    ),
  },
};
