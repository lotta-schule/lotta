import * as React from 'react';
import { render, userEvent } from '../test-utils';
import { Tag } from './Tag';

describe('Tag', () => {
  it('should correctly render a tag', () => {
    const screen = render(<Tag>Tag</Tag>);

    expect(screen.getByText('Tag')).toBeVisible();
  });

  it('should show a Delete Button when a onDelete prop is given', async () => {
    const fireEvent = userEvent.setup({ delay: 100 });
    const onDelete = vi.fn();

    const screen = render(<Tag onDelete={onDelete}>Tag</Tag>);

    const deleteButton = screen.getByRole('button', {
      name: 'Tag Tag löschen',
    });
    expect(deleteButton).toBeVisible();

    await fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalled();
  });
});
