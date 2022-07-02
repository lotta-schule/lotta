import { render, waitFor } from 'test/util';
import { Drawer } from './Drawer';
import userEvent from '@testing-library/user-event';

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
            const onClose = jest.fn();
            const screen = render(
                <Drawer isOpen onClose={() => onClose()}>
                    <div>CONTENT</div>
                </Drawer>
            );
            userEvent.click(screen.getByRole('button', { name: /schließen/i }));
            expect(onClose).toHaveBeenCalled();
        });

        it('should call onClose when the ESC key is pressed', async () => {
            const onClose = jest.fn();
            const screen = render(
                <Drawer isOpen onClose={() => onClose()}>
                    <div>CONTENT</div>
                </Drawer>
            );
            userEvent.type(screen.getByRole('presentation'), '{Escape}');
            expect(onClose).toHaveBeenCalled();
        });
    });
});
