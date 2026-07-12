import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Deletable } from './Deletable';

describe('Deletable', () => {
  it('should render children', () => {
    render(
      <Deletable>
        <span>Content</span>
      </Deletable>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should not render delete button when onDelete is not provided', () => {
    render(
      <Deletable>
        <span>Content</span>
      </Deletable>
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render delete button when onDelete is provided', () => {
    render(
      <Deletable onDelete={vi.fn<() => void>()}>
        <span>Content</span>
      </Deletable>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onDelete when button is clicked', () => {
    const onDelete = vi.fn<() => void>();

    render(
      <Deletable onDelete={onDelete}>
        <span>Content</span>
      </Deletable>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onDelete).toHaveBeenCalled();
  });
});
