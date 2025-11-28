import * as React from 'react';
import { render } from 'test/util';
import { TenantLayout } from './TenantLayout';
import { imageFile, tenant } from 'test/fixtures';

vi.mock('../loader/loadTenant', async () => {
  return {
    loadTenant: vi.fn(async () => ({
      ...tenant,
      backgroundImageFile: imageFile,
      logoImageFile: imageFile,
    })),
  };
});

describe('TenantLayout', () => {
  it('should render title, logo and child', async () => {
    const screen = render(
      await TenantLayout({ children: <div>Child Content</div> })
    );

    expect(screen.getByText('DerEineVonHier')).toBeVisible();
    expect(screen.getByAltText('Logo DerEineVonHier')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should render ScrollToTopButton in NoSsr wrapper', async () => {
    const screen = render(
      await TenantLayout({ children: <div>Child Content</div> })
    );

    expect(
      screen.getByRole('button', { name: /zum anfang der seite/i })
    ).toBeInTheDocument();
  });
});
