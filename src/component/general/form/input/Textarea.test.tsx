import { render, waitFor } from 'test/util';
import { Textarea } from './Textarea';
import userEvent from '@testing-library/user-event';

describe('general/form/input/Textarea', () => {
    it('should render correctly', () => {
        render(<Textarea />);
    });

    it('should grow when entering text', async () => {
        const screen = render(<Textarea value={'this is one line'} />);
        userEvent.type(
            screen.getByRole('textbox'),
            '{enter}Another line{enter}Another line{enter}'
        );
        await waitFor(() => {
            expect(
                screen.getByRole('textbox').parentElement!.style.height
            ).not.toEqual('auto');
        });
    });
});
