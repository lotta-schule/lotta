import { StoryObj, Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Input } from '@lotta-schule/hubert';

export default {
  title: 'Form/Input',
  component: Input,
  argTypes: {},
} as Meta<typeof Input>;

export const Default: StoryObj<typeof Input> = {
  args: {
    placeholder: 'Please type something interesting ...',
  },

  play: async ({ canvasElement }) => {
    const fireEvent = userEvent.setup({ delay: 100 });
    const canvas = within(canvasElement);

    await fireEvent.click(canvas.getByRole('textbox'));
    await fireEvent.keyboard('sample text');

    expect(canvas.getByRole('textbox')).toHaveValue('sample text');
  },
};

export const Inline: StoryObj<typeof Input> = {
  args: {
    ...Default.args,
    inline: true,
  },
};

export const Multiline: StoryObj<typeof Input> = {
  args: {
    ...Default.args,
    multiline: true,
  } as any,

  play: async ({ canvasElement }) => {
    const fireEvent = userEvent.setup({ delay: 100 });
    const canvas = within(canvasElement);

    await fireEvent.click(canvas.getByRole('textbox'));
    await fireEvent.keyboard('sample text\nwith newline');

    expect(canvas.getByRole('textbox')).toHaveValue(
      'sample text\nwith newline'
    );
  },
};
