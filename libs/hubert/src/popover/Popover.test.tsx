import * as React from 'react';
import { render, waitFor } from '../test-utils';
import { Popover } from './Popover';
import userEvent from '@testing-library/user-event';

describe('Popover', () => {
  it('should render a button and not the content', () => {
    const screen = render(
      <Popover buttonProps={{ label: 'Open Popover' }}>
        <div>TADA</div>
      </Popover>
    );
    expect(screen.getByRole('button', { name: /open popover/i })).toBeVisible();
    expect(screen.queryByText('TADA')).toBeNull();
  });

  it('should open when the button is clicked', async () => {
    const fireEvent = userEvent.setup();
    const screen = render(
      <Popover buttonProps={{ label: 'Open Popover' }}>
        <div>TADA</div>
      </Popover>
    );
    await fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('TADA')).toBeVisible();
    });
  });
});
