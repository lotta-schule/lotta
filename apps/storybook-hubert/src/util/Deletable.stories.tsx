import * as React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, Deletable } from '@lotta-schule/hubert';

export default {
  title: 'util/Deletable',
  component: Deletable,
  argTypes: {},
} as Meta<typeof Deletable>;

export const Default: StoryObj<typeof Deletable> = {
  render: (args) => (
    <Deletable {...args}>
      <Avatar
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=rosa-luxemburg"
        title="Rosa Luxemburg"
      />
    </Deletable>
  ),

  args: {
    onDelete: fn(),
  },

  play: async ({ canvasElement, initialArgs }) => {
    const fireEvent = userEvent.setup({ delay: 200 });
    const screen = within(canvasElement);

    expect(screen.getByRole('button')).toHaveStyle({ opacity: 0 });

    await fireEvent.click(screen.getByRole('button'));

    expect(initialArgs.onDelete).toHaveBeenCalled();
  },
};
