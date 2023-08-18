import { render } from '../test-utils';
import { Divider } from './Divider';

describe('general/divider', () => {
  it('should render correctly', () => {
    const screen = render(<Divider />);
    expect(screen.getByRole('separator')).toBeVisible();
  });
});
