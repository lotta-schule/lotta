import * as React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, spyOn, waitFor, within } from 'storybook/test';
import { KeyboardArrowLeft, LoadingButton } from '@lotta-schule/hubert';

export default {
  title: 'Buttons/LoadingButton',
  component: LoadingButton,
  args: {
    onAction: fn(),
    onError: fn(),
    onComplete: fn(),
  },
  argTypes: {},
  decorators: [
    (Story, { args, parameters }) => {
      if (args.onAction) {
        spyOn(args, 'onAction').mockImplementationOnce(
          () =>
            new Promise<void>((resolve, reject) => {
              setTimeout(() => {
                if (parameters.fail) {
                  const message =
                    typeof parameters.fail === 'string' &&
                    parameters.fail.length
                      ? parameters.fail
                      : 'I failed';
                  reject(new Error(message));
                } else {
                  resolve();
                }
              }, 1500);
            })
        );
      }

      return <Story />;
    },
  ],
} as Meta<typeof LoadingButton>;

export const Default: StoryObj<typeof LoadingButton> = {
  args: {
    state: 'loading',
    label: 'save',
    onAction: undefined,
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
  },
  play: async ({ canvasElement, args: { onAction, onComplete } }) => {
    const screen = within(canvasElement);

    await fireEvent.click(
      await screen.findByRole('button', { name: /let me succeed/i })
    );

    expect(onAction).toHaveBeenCalled();

    await waitFor(() => {
      expect(
        screen.queryByRole('progressbar'),
        'progressbar not visible'
      ).toBeVisible();
    });

    await waitFor(
      () => {
        expect(screen.queryByRole('progressbar')).toBeNull();
      },
      { timeout: 2000 }
    );

    expect(onComplete).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByTestId('SuccessIcon')).toBeVisible();
    });
  },
};

export const ErrorAction: StoryObj<typeof LoadingButton> = {
  args: {
    label: 'let me fail',
    icon: <KeyboardArrowLeft />,
  },
  parameters: { fail: 'I failed' },
  play: async ({ canvasElement, args: { onAction, onError } }) => {
    const screen = within(canvasElement);

    fireEvent.click(
      await screen.findByRole('button', { name: /let me fail/i })
    );

    expect(onAction).toHaveBeenCalled();

    await waitFor(() => {
      expect(
        screen.queryByRole('progressbar'),
        'progressbar should be visible'
      ).toBeVisible();
    });

    await waitFor(
      () => {
        expect(screen.queryByRole('progressbar')).toBeNull();
      },
      { timeout: 2000 }
    );

    expect(onError).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByTestId('ErrorIcon')).toBeVisible();
    });
  },
};
