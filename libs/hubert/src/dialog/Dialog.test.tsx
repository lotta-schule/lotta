import * as React from 'react';
import { render, userEvent, waitFor } from '../test-utils';
import { Dialog } from './Dialog';

describe('general/dialog', () => {
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

    it('should call "onRequestClose" prop when dialog closes', async () => {
      const onClose = vi.fn();

      const screen = render(
        <Dialog title={'Achtung!'} open onRequestClose={onClose}>
          lorem ipsum dolor sit amet
        </Dialog>
      );

      screen.getByRole('dialog').dispatchEvent(new Event('close'));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
