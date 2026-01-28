import { render, within } from 'test/util';
import { AdminPage } from './AdminPage';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { loadTenant } from 'loader/loadTenant';
import { MockedFunction } from 'vitest';

vi.mock('loader/loadTenant', async () => ({
  loadTenant: vi.fn(),
}));
vi.mock('helper');

vi.mock(
  'next/link',
  () =>
    function NextLinkMock({ children, ...props }: React.PropsWithChildren) {
      return <a {...props}>{children}</a>;
    }
);

const loadTenantMock = loadTenant as MockedFunction<typeof loadTenant>;

describe('AdminPage', () => {
  beforeEach(() => {
    loadTenantMock.mockResolvedValue({
      configuration: {},
      logoImageFile: 'logo.png',
      title: 'Tenant Title',
    } as any);
  });

  it('renders title with icon', async () => {
    const screen = render(
      <AdminPage title="Test Title" icon={faHome}>
        <div>Child content</div>
      </AdminPage>
    );
    screen.rerender(
      <AdminPage title="Test Title" icon={faHome}>
        <div>Child content</div>
      </AdminPage>
    );
    expect(await screen.findByText('Test Title')).toBeInTheDocument();
    expect(
      within(screen.getByRole('heading', { level: 2 })).getByRole('img', {
        hidden: true,
      })
    ).toHaveClass(/fa-house/);
  });

  it('renders home link when hasHomeLink is true', async () => {
    const screen = render(
      <AdminPage title="Test Title" hasHomeLink>
        <div>Child content</div>
      </AdminPage>
    );
    screen.rerender(
      <AdminPage title="Test Title" hasHomeLink>
        <div>Child content</div>
      </AdminPage>
    );
    expect(
      await screen.findByTitle('Zurück zum Administrations-Hauptmenü')
    ).toBeInTheDocument();
  });

  it('renders logo link if logoImageFile is present', async () => {
    const screen = render(
      <AdminPage title="Test Title">
        <div>Child content</div>
      </AdminPage>
    );
    screen.rerender(
      <AdminPage title="Test Title">
        <div>Child content</div>
      </AdminPage>
    );
    expect(await screen.findByTitle('Startseite')).toBeInTheDocument();
  });

  it('renders children content', async () => {
    const screen = render(
      <AdminPage title="Test Title">
        <div>Child content</div>
      </AdminPage>
    );
    screen.rerender(
      <AdminPage title="Test Title">
        <div>Child content</div>
      </AdminPage>
    );
    expect(await screen.findByText('Child content')).toBeInTheDocument();
  });

  it('renders Close button link', async () => {
    const screen = render(
      <AdminPage title="Test Title">
        <div>Child content</div>
      </AdminPage>
    );
    screen.rerender(
      <AdminPage title="Test Title">
        <div>Child content</div>
      </AdminPage>
    );
    const closeButton = await screen.findByRole('button');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton.closest('a')).toHaveAttribute('href', '/');
  });
});
