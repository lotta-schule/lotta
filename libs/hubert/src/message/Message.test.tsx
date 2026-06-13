import * as React from 'react';
import { Message } from './Message';
import { render, waitFor } from '../test-utils';

describe('util/Message', () => {
  it('should show a given message', async () => {
    const screen = render(<Message message={'A Message'} color={'#ccc'} />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeVisible();
    });
  });

  it('should not show if an empty message is provided', async () => {
    const screen = render(<Message message={''} color={'#ccc'} />);

    expect(screen.queryByRole('alert')).toBeNull();
  });
});
