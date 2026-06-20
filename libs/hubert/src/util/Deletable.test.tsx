import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Deletable } from './Deletable';
import { userEvent } from '#/test-utils';

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
    const onDelete = vi.fn();
    render(
      <Deletable onDelete={onDelete}>
        <span>Content</span>
      </Deletable>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('title', 'löschen');
  });

  it('should use custom title', () => {
    const onDelete = vi.fn();
    render(
      <Deletable onDelete={onDelete} title="Remove">
        <span>Content</span>
      </Deletable>
    );

    expect(screen.getByRole('button')).toHaveAttribute('title', 'Remove');
  });

  it('should call onDelete when button is clicked', async () => {
    const onDelete = vi.fn();
    const fireEvent = userEvent.setup();

    render(
      <Deletable onDelete={onDelete}>
        <span>Content</span>
      </Deletable>
    );

    await fireEvent.click(screen.getByRole('button'));

    expect(onDelete).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(
      <Deletable className="custom-class">
        <span>Content</span>
      </Deletable>
    );

    expect(screen.getByText('Content').parentElement).toHaveClass(
      'custom-class'
    );
  });

  it('should spread additional props to root div', () => {
    render(
      <Deletable data-testid="deletable" role="region">
        <span>Content</span>
      </Deletable>
    );

    expect(screen.getByTestId('deletable')).toHaveAttribute('role', 'region');
  });
});
