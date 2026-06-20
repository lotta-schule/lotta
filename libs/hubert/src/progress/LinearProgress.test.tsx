import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { LinearProgress } from './LinearProgress';
import styles from './LinearProgress.module.scss';

describe('LinearProgress', () => {
  it('should render with default props', () => {
    render(<LinearProgress />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuenow', '0');
  });

  it('should display value when provided', () => {
    render(<LinearProgress value={75} />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '75');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('should set indicator width based on value', () => {
    const { container } = render(<LinearProgress value={60} />);

    const indicator = container.querySelector('.indicator') as HTMLElement;
    expect(indicator).toHaveStyle({ width: '60%' });
  });

  it('should apply indeterminate class when isIndeterminate is true', () => {
    const { container } = render(<LinearProgress isIndeterminate />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(styles.indeterminate);
  });

  it('should not apply indeterminate class when isIndeterminate is false', () => {
    const { container } = render(<LinearProgress isIndeterminate={false} />);

    const root = container.firstChild as HTMLElement;
    expect(root).not.toHaveClass(styles.indeterminate);
  });

  it('should apply custom className', () => {
    const { container } = render(<LinearProgress className="custom-class" />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('custom-class');
  });

  it('should spread additional props', () => {
    render(<LinearProgress data-testid="progress" aria-label="Loading" />);

    const progress = screen.getByTestId('progress');
    expect(progress).toHaveAttribute('aria-label', 'Loading');
  });

  it('should handle value of 0', () => {
    const { container } = render(<LinearProgress value={0} />);

    const indicator = container.querySelector('.indicator') as HTMLElement;
    expect(indicator).toHaveStyle({ width: '0%' });
  });

  it('should handle value of 100', () => {
    const { container } = render(<LinearProgress value={100} />);

    const indicator = container.querySelector('.indicator') as HTMLElement;
    expect(indicator).toHaveStyle({ width: '100%' });
  });

  it('should round decimal values', () => {
    const { container } = render(<LinearProgress value={66.7} />);

    const indicator = container.querySelector('.indicator') as HTMLElement;
    expect(indicator).toHaveStyle({ width: '66%' });
  });
});
