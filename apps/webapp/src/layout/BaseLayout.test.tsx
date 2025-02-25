import * as React from 'react';
import { render } from 'test/util';
import { BaseLayout } from './BaseLayout';
import { imageFile, tenant } from 'test/fixtures';
import { Tenant } from 'util/tenant';

const tenantMock = {
  ...tenant,
  backgroundImageFile: imageFile,
  logoImageFile: imageFile,
} as Tenant;

describe('BaseLayout', () => {
  it('should render title, logo and child', () => {
    const screen = render(
      <BaseLayout>
        <div>Child Content</div>
      </BaseLayout>,
      {},
      { tenant: tenantMock }
    );

    expect(screen.getByText('DerEineVonHier')).toBeVisible();
    expect(screen.getByAltText('Logo DerEineVonHier')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should apply background image style', () => {
    const screen = render(
      <BaseLayout>
        <div>Child Content</div>
      </BaseLayout>,
      {},
      { tenant: tenantMock }
    );

    const styleTag = screen.container.querySelector('style');
    expect(styleTag).not.toBeNull();
    expect(styleTag).toHaveTextContent(
      /url\(https:\/\/example\.com\/123\/pagebg_1024\.webp\) 1x/
    );
  });

  it('should render ScrollToTopButton in NoSsr wrapper', () => {
    const screen = render(
      <BaseLayout>
        <div>Child Content</div>
      </BaseLayout>
    );

    expect(
      screen.getByRole('button', { name: /zum anfang der seite/i })
    ).toBeInTheDocument();
  });

  it('should render Navbar', () => {
    const screen = render(
      <BaseLayout>
        <div>Child Content</div>
      </BaseLayout>
    );

    expect(screen.getAllByRole('navigation')).not.toHaveLength(0);
  });
});
