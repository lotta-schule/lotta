import { render } from 'test/util';
import { AdminPageTitle } from './AdminPageTitle';

vi.mock('@fortawesome/react-fontawesome', async () => ({
  ...vi.importActual('@fortawesome/react-fontawesome'),
  FontAwesomeIcon: vi.fn(() => null),
}));

describe('AdminPageTitle', () => {
  it('should render correctly', () => {
    const screen = render(
      <AdminPageTitle backUrl={'/admin'}>My Page</AdminPageTitle>
    );

    expect(screen.container.firstChild).toMatchSnapshot();
  });
});
