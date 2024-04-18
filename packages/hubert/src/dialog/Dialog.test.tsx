import * as React from 'react';
import { render, waitFor } from '../test-utils';
import { Dialog } from './Dialog';
import userEvent from '@testing-library/user-event';

describe('general/dialog', () => {
  it('should render the shared in the "dialogContainer" element and remove it', () => {
    const screen = render(<Dialog open title={'Achtung!'} />);
    const dialogContainer = document.getElementById(
      'dialogContainer'
    ) as HTMLDivElement;
    expect(dialogContainer.childElementCount).toEqual(1);
    expect(dialogContainer).toContainElement(screen.getByRole('dialog'));

    // remove again
    screen.rerender(<>empty</>);
    expect(dialogContainer.hasChildNodes()).toBe(false);
  });

  it('should not show the dialog when not open', () => {
    const screen = render(
      <Dialog title={'Achtung!'}>lorem ipsum dolor sit amet</Dialog>
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should show the dialog when open', async () => {
    const screen = render(
      <Dialog title={'Achtung!'} open>
        lorem ipsum dolor sit amet
      </Dialog>
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });
  });

  describe('close button', () => {
    it('should not show the close button when "onRequestClose" prop is not set', () => {
      const screen = render(
        <Dialog title={'Achtung!'} open>
          lorem ipsum dolor sit amet
        </Dialog>
      );

      expect(screen.queryByRole('button', { name: 'schließen' })).toBeNull();
    });

    it('should show the close button when "onRequestClose" prop is set', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const screen = render(
        <Dialog title={'Achtung!'} open onRequestClose={onClose}>
          lorem ipsum dolor sit amet
        </Dialog>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'schließen' })).toBeVisible();
      });
      await user.click(screen.getByRole('button', { name: 'schließen' }));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call "onRequestClose" prop when ESC key is pressed.', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <Dialog title={'Achtung!'} open onRequestClose={onClose}>
          lorem ipsum dolor sit amet
        </Dialog>
      );

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
