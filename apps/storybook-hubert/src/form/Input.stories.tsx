import * as React from 'react';
import { StoryObj, Meta } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Input } from '@lotta-schule/hubert';

export default {
  title: 'Form/Input',
  component: Input,
  render: (args) => {
    const [, updateArgs] = useArgs();

    const onChange: any = (e: React.FormEvent<HTMLInputElement>) => {
      updateArgs({ value: e.currentTarget.value });
    };

    return <Input {...args} onChange={onChange} />;
  },
  argTypes: {},
  args: {
    value: '',
  },
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

    const textarea = canvas.getByRole('textbox');
    expect(textarea).toHaveValue('sample text\nwith newline');

    await waitFor(() => {
      expect(textarea.scrollHeight).toEqual(textarea.clientHeight);
    });
  },
};
