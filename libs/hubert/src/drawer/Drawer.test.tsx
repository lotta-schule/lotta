import * as React from 'react';
import { render, userEvent, waitFor } from '../test-utils';
import { Drawer } from './Drawer';

describe('general/Drawer', () => {
  it('should not show drawer when not open', async () => {
    const screen = render(<Drawer isOpen={false}>CONTENT</Drawer>);

    await waitFor(() =>
      expect(
        screen.getByRole('presentation', { hidden: true })
      ).not.toBeVisible()
    );
  });

  it('should show drawer when opening', async () => {
    const screen = render(
      <Drawer isOpen={false}>
        <div>CONTENT</div>
      </Drawer>
    );
    screen.rerender(
      <Drawer isOpen={true}>
        <div>CONTENT</div>
      </Drawer>
    );
    await waitFor(() => {
      expect(screen.getByRole('presentation')).toBeVisible();
      expect(screen.getByText('CONTENT')).toBeVisible();
    });
  });

  describe('close', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const screen = render(
        <Drawer isOpen onClose={() => onClose()}>
          <div>CONTENT</div>
        </Drawer>
      );

      await user.click(screen.getByRole('button', { name: /schließen/i }));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when the ESC key is pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const screen = render(
        <Drawer isOpen onClose={() => onClose()}>
          <div>CONTENT</div>
        </Drawer>
      );

      await user.type(screen.getByRole('presentation'), '{Escape}');
      expect(onClose).toHaveBeenCalled();
    });
  });
});
