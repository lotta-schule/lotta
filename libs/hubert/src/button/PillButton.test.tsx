import { render } from 'test-utils';
import { PillButton } from './PillButton';
import { Close } from '../icon';

describe('PillButton', () => {
  it('renders correctly', () => {
    const { container } = render(
      <PillButton icon={<Close />}>Button</PillButton>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
