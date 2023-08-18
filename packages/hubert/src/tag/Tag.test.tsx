import * as React from 'react';
import { render } from '../test-utils';
import { Tag } from './Tag';
import userEvent from '@testing-library/user-event';

describe('Tag', () => {
  it('should correctly render a tag', () => {
    render(<Tag>Tag</Tag>);
  });

  it('should show a Delete Button when a onDelete prop is given', async () => {
    const fireEvent = userEvent.setup({ delay: 100 });
    const fn = jest.fn();
    const screen = render(<Tag onDelete={fn}>Tag</Tag>);
    const deleteButton = screen.getByRole('button', {
      name: 'Tag Tag löschen',
    });
    expect(deleteButton).toBeVisible();
    await fireEvent.click(deleteButton);
    expect(fn).toHaveBeenCalled();
  });
});
