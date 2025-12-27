import * as React from 'react';
import { LoadingButton } from './LoadingButton';
import { act, createPromise, render, userEvent, waitFor } from '../test-utils';
import { KeyboardArrowLeft } from '../icon';

describe('LoadingButton', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('renders button label', () => {
    const screen = render(<LoadingButton label="Click Me" />);
    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(button).toBeInTheDocument();
  });

  it('renders children when label is not provided', () => {
    const screen = render(<LoadingButton>Click Me</LoadingButton>);
    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(button).toBeInTheDocument();
  });

  it('forwards ref to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    const screen = render(<LoadingButton label="Click Me" ref={ref} />);
    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(ref.current).toBe(button);
  });

  it('should disable the button on loading, success, error', () => {
    const screen = render(<LoadingButton state={'idle'} label="Click Me" />);
    expect(
      screen.getByRole('button', { name: /Click Me/i })
    ).not.toBeDisabled();
    screen.rerender(<LoadingButton state={'loading'} label="Click Me" />);
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeDisabled();
    screen.rerender(<LoadingButton state={'success'} label="Click Me" />);
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeDisabled();
    screen.rerender(<LoadingButton state={'error'} label="Click Me" />);
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeDisabled();
  });

  it('should be able to show an icon', async () => {
    const screen = render(
      <LoadingButton
        icon={<KeyboardArrowLeft data-testid="TestIcon" />}
        label="Click Me"
      />
    );
    expect(screen.getByTestId('TestIcon')).toBeVisible();
    expect(screen.queryByRole('progressbar')).toBeNull();
    screen.rerender(
      <LoadingButton
        state={'loading'}
        icon={<KeyboardArrowLeft data-testid="TestIcon" />}
        label="Click Me"
      />
    );
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeVisible();
    });
    expect(screen.queryByTestId('TestIcon')).toBeNull();
  });

  it('should show loading spinner on loading', () => {
    const screen = render(<LoadingButton state={'loading'} label="Click Me" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show the success icon on success', () => {
    const screen = render(<LoadingButton state={'success'} label="Click Me" />);
    expect(screen.getByTestId('SuccessIcon')).toBeInTheDocument();
  });

  it('should show the error icon on error', () => {
    const screen = render(<LoadingButton state={'error'} label="Click Me" />);
    expect(screen.getByTestId('ErrorIcon')).toBeInTheDocument();
  });

  describe('onAction', () => {
    it('should call the handler and show the success state', async () => {
      const fireEvent = userEvent.setup();
      const { promise, resolve } = createPromise();
      const onAction = vi.fn(() => promise);
      const onComplete = vi.fn();
      const onError = vi.fn();
      const screen = render(
        <LoadingButton
          label="Click Me"
          onAction={onAction}
          onComplete={onComplete}
          onError={onError}
        />
      );
      await fireEvent.click(screen.getByRole('button', { name: /Click Me/i }));

      expect(onAction).toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeVisible();
      });

      resolve();

      await waitFor(() => {
        expect(screen.getByTestId('SuccessIcon')).toBeVisible();
      });

      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
      expect(onError).not.toHaveBeenCalled();
    });

    it('should call the handler and show the error state', async () => {
      const fireEvent = userEvent.setup();
      const { promise, reject } = createPromise();
      const onAction = vi.fn(() => promise);
      const onComplete = vi.fn();
      const onError = vi.fn();
      const screen = render(
        <LoadingButton
          label="Click Me"
          onAction={onAction}
          onComplete={onComplete}
          onError={onError}
        />
      );
      await fireEvent.click(screen.getByRole('button', { name: /Click Me/i }));

      expect(onAction).toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeVisible();
      });

      reject();

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
      expect(onComplete).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.getByTestId('ErrorIcon')).toBeVisible();
      });
    });

    describe('embedded in a form', () => {
      it("should not call onAction if the type is not set to 'submit'", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn<React.FormEventHandler>((e) => {
          e.preventDefault();

          return false;
        });
        const onAction = vi.fn();
        const screen = render(
          <form method="get" onSubmit={onSubmit}>
            <input type="text" defaultValue="" />
            <input type="submit" value="Submit the form" />
            <LoadingButton label="Click Me" onAction={onAction} />
          </form>
        );

        await user.fill(screen.getByRole('textbox'), 'Hello World');
        await user.click(
          screen.getByRole('button', { name: /Submit the form/i })
        );

        await waitFor(() => {
          expect(onSubmit).toHaveBeenCalled();
        });
        expect(onAction).not.toHaveBeenCalled();
      });

      it("should run the onAction handle when it's in a form that is being submitted", async () => {
        const user = userEvent.setup();
        const onAction = vi.fn(() => Promise.resolve());
        const screen = render(
          <form>
            <input type="text" />
            <input type="submit" value="Submit the form" />
            <LoadingButton
              type="submit"
              label="Send the form"
              onAction={onAction}
            />
          </form>
        );

        await user.fill(screen.getByRole('textbox'), 'Hello World');
        await user.click(
          screen.getByRole('button', { name: /Send the form/i })
        );

        expect(onAction).toHaveBeenCalled();

        await waitFor(() => {
          expect(screen.getByTestId('SuccessIcon')).toBeVisible();
        });
      });
    });

    describe('return to idle state', () => {
      afterEach(() => {
        vi.useRealTimers();
      });

      it('should return to the idle state after a waiting time', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        const user = userEvent.setup();
        const onAction = vi.fn(async () => void 0);
        const screen = render(
          <LoadingButton label="Click Me" onAction={onAction} />
        );
        await user.click(screen.getByRole('button', { name: /Click Me/i }));

        await waitFor(() => {
          expect(onAction).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(screen.getByTestId('SuccessIcon')).toBeVisible();
        });

        await act(() => vi.advanceTimersByTimeAsync(2000));

        expect(
          screen.getByRole('button', { name: /Click Me/i })
        ).not.toBeDisabled();
        expect(screen.queryByTestId('SuccessIcon')).toBeNull();
      });

      it('should keep its state after the request if resetState=false', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        const user = userEvent.setup();
        const onAction = vi.fn(() => Promise.resolve());
        const screen = render(
          <LoadingButton
            label="Click Me"
            onAction={onAction}
            resetState={false}
          />
        );
        await user.click(screen.getByRole('button', { name: /Click Me/i }));

        await waitFor(() => {
          expect(onAction).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(screen.getByTestId('SuccessIcon')).toBeInTheDocument();
        });

        await act(() => vi.advanceTimersByTimeAsync(2000));

        expect(screen.getByTestId('SuccessIcon')).toBeInTheDocument();
      });
    });
  });
});
