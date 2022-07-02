import { render, waitFor } from 'test/util';
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
});
