import { render } from '#/test/util.js';
import { AdminPageTitle } from './AdminPageTitle.js';

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
