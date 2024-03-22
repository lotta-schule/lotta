import * as React from 'react';
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { KeyboardArrowLeft, LoadingButton } from '@lotta-schule/hubert';

export default {
  title: 'Buttons/LoadingButton',
  component: LoadingButton,
  argTypes: {},
} as Meta<typeof LoadingButton>;

export const Default: StoryObj<typeof LoadingButton> = {
  args: {
    state: 'loading',
    label: 'save',
  },
};

export const WithIcon: StoryObj<typeof LoadingButton> = {
  args: {
    icon: <KeyboardArrowLeft />,
    label: 'save',
  },
};

export const SuccessAction: StoryObj<typeof LoadingButton> = {
  args: {
    label: 'let me succeed',
    icon: <KeyboardArrowLeft />,
    onAction: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);

    fireEvent.click(
      await screen.findByRole('button', { name: /let me succeed/i })
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
      expect(screen.getByTestId('SuccessIcon')).toBeVisible();
    });
  },
};

export const ErrorAction: StoryObj<typeof LoadingButton> = {
  args: {
    label: 'let me fail',
    icon: <KeyboardArrowLeft />,
    onAction: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      throw new Error('I failed');
    },
  },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);

    fireEvent.click(
      await screen.findByRole('button', { name: /let me fail/i })
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
      expect(screen.getByTestId('ErrorIcon')).toBeVisible();
    });
  },
};
