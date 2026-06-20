import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { CircularProgress } from './CircularProgress';

describe('CircularProgress', () => {
  it('should render with default props', () => {
    render(<CircularProgress />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuenow', '0');
  });

  it('should display value when provided', () => {
    render(<CircularProgress value={75} />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '75');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('should show percentage text when showValue is true', () => {
    render(<CircularProgress value={50} showValue />);

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should not show percentage text when showValue is false', () => {
    render(<CircularProgress value={50} showValue={false} />);

    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('should apply custom size', () => {
    const { container } = render(<CircularProgress size="100px" />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveStyle({ width: '100px', height: '100px' });
  });

  it('should apply custom color', () => {
    const { container } = render(<CircularProgress color="red" />);

    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue('--lotta-circular-progress-color')).toBe(
      'red'
    );
  });

  it('should apply indeterminate class when isIndeterminate is true', () => {
    const { container } = render(<CircularProgress isIndeterminate />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('indeterminate');
  });

  it('should not apply indeterminate class when isIndeterminate is false', () => {
    const { container } = render(<CircularProgress isIndeterminate={false} />);

    const root = container.firstChild as HTMLElement;
    expect(root).not.toHaveClass('indeterminate');
  });

  it('should apply custom className', () => {
    const { container } = render(<CircularProgress className="custom-class" />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('custom-class');
  });

  it('should spread additional props', () => {
    render(<CircularProgress data-testid="progress" aria-label="Loading" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveAttribute('aria-label', 'Loading');
  });

  it('should set CSS variable for value', () => {
    const { container } = render(<CircularProgress value={25} />);

    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue('--value')).toBe('0.25');
  });
});
