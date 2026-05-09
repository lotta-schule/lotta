import { render } from '#/test/util.js';
import { AdminPageSection } from './AdminPageSection.js';

describe('AdminPageSection', () => {
  it('should render a section', () => {
    const screen = render(<AdminPageSection title="Allgemein" />);

    expect(screen.getByRole('heading', { name: 'Allgemein' })).toBeVisible();
  });

  it('should render a bottomtoolbar section', () => {
    const screen = render(<AdminPageSection bottomToolbar />);

    expect(screen.container.firstChild).toMatchSnapshot();
  });
});
