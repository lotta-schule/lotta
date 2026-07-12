import { StoryObj, Meta } from '@storybook/react-vite';
import { expect, fireEvent, waitFor, within } from 'storybook/test';
import { Checkbox } from '@lotta-schule/hubert';

export default {
  title: 'Form/Checkbox',
  component: Checkbox,
  args: {
    children: 'Yes, I accept all the evil I am forced to',
    isDisabled: false,
  },
} as Meta<typeof Checkbox>;

export const Default: StoryObj<typeof Checkbox> = {
  args: {},

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    void fireEvent.click(canvas.getByRole('checkbox'));

    await waitFor(() => {
      void expect(canvas.getByRole('checkbox')).toBeChecked();
    });
  },
};
