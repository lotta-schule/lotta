import { render } from '../test-utils';
import { Badge } from './Badge';

describe('shared/general/badge', () => {
  it('should render a given number in a badge', () => {
    const screen = render(<Badge value={99} />);
    expect(screen.getByRole('status')).toHaveTextContent('99');
  });
  it('should render a given string in a badge', () => {
    const screen = render(<Badge value={'!'} />);
    expect(screen.getByRole('status')).toHaveTextContent('!');
  });
  it('should render nothing when value "0" is given', () => {
    const screen = render(<Badge value={0} />);
    expect(screen.queryByRole('status')).toBeNull();
  });
  it('should render nothing when empty string value is given', () => {
    const screen = render(<Badge value={''} />);
    expect(screen.queryByRole('status')).toBeNull();
  });
});
