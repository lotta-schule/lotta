import { render } from 'test/util';
import { Checkbox } from './Checkbox';

describe('component/general/form/checkbox', () => {
    it('should render correctly', () => {
        render(<Checkbox label={'A label'} />);
    });

    it('should show the correct label', () => {
        const screen = render(<Checkbox label={'A label'} />);
        expect(screen.getByText('A label')).toBeVisible();
    });
});
