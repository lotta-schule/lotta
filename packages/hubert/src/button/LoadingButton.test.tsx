import * as React from 'react';
import { LoadingButton } from './LoadingButton';
import { render } from '../test-utils';

describe('LoadingButton', () => {
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

  it('disables the button when loading is true', () => {
    const screen = render(<LoadingButton loading={true} label="Click Me" />);
    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(button).toBeDisabled();
  });

  it('does not disable the button when disabled is false', () => {
    const screen = render(<LoadingButton disabled={false} label="Click Me" />);
    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(button).not.toBeDisabled();
  });

  it('forwards ref to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    const screen = render(<LoadingButton label="Click Me" ref={ref} />);
    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(ref.current).toBe(button);
  });

  describe('when loading', () => {
    it('should disable the button', () => {
      const screen = render(<LoadingButton disabled={true} label="Click Me" />);
      const button = screen.getByRole('button', { name: /Click Me/i });
      expect(button).toBeDisabled();
    });

    it('should show the loading indicator', () => {
      const screen = render(<LoadingButton loading={true} label="Click Me" />);
      const loadingIndicator = screen.getByRole('progressbar');
      expect(loadingIndicator).toBeVisible();
    });
  });

  describe('when not loading', () => {
    it('should not not disable the button', () => {
      const screen = render(<LoadingButton loading={false} label="Click Me" />);
      const button = screen.getByRole('button', { name: /Click Me/i });
      expect(button).not.toBeDisabled();
    });
  });
});
