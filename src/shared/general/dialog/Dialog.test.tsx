import userEvent from '@testing-library/user-event';
import { render } from 'test/util';
import { Dialog } from './Dialog';

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

    it('should show the dialog when open', () => {
        const screen = render(
            <Dialog title={'Achtung!'} open>
                lorem ipsum dolor sit amet
            </Dialog>
        );

        expect(screen.getByRole('dialog')).toBeVisible();
    });

    describe('close button', () => {
        it('should not show the close button when "onRequestClose" prop is not set', () => {
            const screen = render(
                <Dialog title={'Achtung!'} open>
                    lorem ipsum dolor sit amet
                </Dialog>
            );

            expect(
                screen.queryByRole('button', { name: 'schließen' })
            ).toBeNull();
        });

        it('should show the close button when "onRequestClose" prop is set', () => {
            const onClose = jest.fn();
            const screen = render(
                <Dialog title={'Achtung!'} open onRequestClose={onClose}>
                    lorem ipsum dolor sit amet
                </Dialog>
            );

            expect(
                screen.getByRole('button', { name: 'schließen' })
            ).toBeVisible();
            userEvent.click(screen.getByRole('button', { name: 'schließen' }));
            expect(onClose).toHaveBeenCalled();
        });

        it('should call "onRequestClose" prop when ESC key is pressed.', () => {
            const onClose = jest.fn();
            render(
                <Dialog title={'Achtung!'} open onRequestClose={onClose}>
                    lorem ipsum dolor sit amet
                </Dialog>
            );

            userEvent.keyboard('{esc}');
            expect(onClose).toHaveBeenCalled();
        });
    });
});
