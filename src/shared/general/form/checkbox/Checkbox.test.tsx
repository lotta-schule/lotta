import userEvent from '@testing-library/user-event';
import { render } from 'test/util';
import { Checkbox } from './Checkbox';

describe('shared/general/form/checkbox', () => {
    it('should show the correct label', () => {
        const screen = render(<Checkbox>A label</Checkbox>);
        expect(screen.getByText('A label')).toBeVisible();
    });

    it('should show a selected checkbox and unselect it on click', () => {
        const onChange = jest.fn();
        const screen = render(
            <Checkbox isSelected onChange={onChange}>
                A label
            </Checkbox>
        );
        userEvent.click(screen.getByRole('checkbox'));
        expect(onChange).toHaveBeenCalledWith(false);
    });
});
