import * as React from 'react';
import { render, waitFor } from '../../test-utils';
import { Textarea } from './Textarea';
import userEvent from '@testing-library/user-event';

describe('general/form/input/Textarea', () => {
  it('should render correctly', () => {
    render(<Textarea />);
  });

  it('should grow when entering text', async () => {
    const screen = render(<Textarea value={'this is one line'} />);
    await userEvent.type(
      screen.getByRole('textbox'),
      '{enter}Another line{enter}Another line{enter}'
    );
    await waitFor(() => {
      expect(
        screen.getByRole('textbox').parentElement!.style.height
      ).not.toEqual('auto');
    });
  });

  it('should go back to being small when text is altered', async () => {
    const screen = render(
      <Textarea value={'this is one line\nThis is another'} />
    );
    await waitFor(() => {
      expect(
        screen.getByRole('textbox').parentElement!.style.minHeight
      ).not.toEqual('auto');
    });
    screen.rerender(<Textarea value={''} />);

    await waitFor(() => {
      expect(
        screen.getByRole('textbox').parentElement!.style.minHeight
      ).toEqual('auto');
    });
  });
});
