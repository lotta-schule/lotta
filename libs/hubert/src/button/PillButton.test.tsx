import { render } from '#/test-utils';
import { PillButton } from './PillButton.js';
import { Close } from '../icon/index.js';

describe('PillButton', () => {
  it('renders correctly', () => {
    const { container } = render(
      <PillButton icon={<Close />}>Button</PillButton>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
