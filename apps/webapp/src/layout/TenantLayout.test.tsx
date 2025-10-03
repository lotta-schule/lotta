import * as React from 'react';
import { render } from 'test/util';
import { TenantLayout } from './TenantLayout';
import { imageFile, tenant } from 'test/fixtures';
import { Tenant } from 'util/tenant';

const tenantMock = {
  ...tenant,
  backgroundImageFile: imageFile,
  logoImageFile: imageFile,
} as Tenant;

describe('TenantLayout', () => {
  it('should render title, logo and child', () => {
    const screen = render(
      <TenantLayout>
        <div>Child Content</div>
      </TenantLayout>,
      {},
      { tenant: tenantMock }
    );

    expect(screen.getByText('DerEineVonHier')).toBeVisible();
    expect(screen.getByAltText('Logo DerEineVonHier')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should apply background image style', () => {
    const screen = render(
      <TenantLayout>
        <div>Child Content</div>
      </TenantLayout>,
      {},
      { tenant: tenantMock }
    );

    const styleTag = screen.container.querySelector('style');
    expect(styleTag).not.toBeNull();
    expect(styleTag!.innerHTML).toMatchInlineSnapshot(`
      "@media screen and (min-width: 600px) {
            body::after {
              background-image: image-set(url(https://example.com/123/pagebg_1024) 1x,url(https://example.com/123/pagebg_1920) 2x);
            }
        }
        @media screen and (min-width: 1280px) {
            body::after {
              background-image: image-set(url(https://example.com/123/pagebg_1280) 1x,url(https://example.com/123/pagebg_2560) 2x);
            }
        }"
    `);
  });

  it('should render ScrollToTopButton in NoSsr wrapper', () => {
    const screen = render(
      <TenantLayout>
        <div>Child Content</div>
      </TenantLayout>
    );

    expect(
      screen.getByRole('button', { name: /zum anfang der seite/i })
    ).toBeInTheDocument();
  });
});
