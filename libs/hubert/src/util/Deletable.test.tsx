import * as React from 'react';
import { render, userEvent, waitFor } from '../test-utils';
import { Deletable } from './Deletable';

describe('shared/general/util/Deletable', () => {
  it('should show a Delete button when onDelete is given', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const screen = render(
      <Deletable onDelete={onDelete}>
        <img width={300} height={300} alt={''} role="img" />
      </Deletable>
    );
    await user.hover(screen.getByRole('img'));
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeVisible();
    });
    await user.click(screen.getByRole('button'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('should not show a Delete button when onDelete is not given', () => {
    const screen = render(
      <Deletable>
        <img width={300} height={300} alt={''} />
      </Deletable>
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});
