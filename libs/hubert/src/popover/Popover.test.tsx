import * as React from 'react';
import { render, userEvent, waitFor } from '../test-utils';
import { Popover } from './Popover';
import { PopoverTrigger } from './PopoverTrigger';
import { PopoverContent } from './PopoverContent';

describe('Popover', () => {
  it('should render a button and not the content, and open the popover on button click', async () => {
    const fireEvent = userEvent.setup();

    const screen = render(
      <Popover>
        <PopoverTrigger label="Open Popover" />
        <PopoverContent>
          <div>TADA</div>
        </PopoverContent>
      </Popover>
    );
    expect(screen.getByRole('button', { name: /open popover/i })).toBeVisible();
    expect(screen.queryByText('TADA')).not.toBeVisible();

    await fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('TADA')).toBeVisible();
    });
  });
});
