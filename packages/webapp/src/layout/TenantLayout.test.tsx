import * as React from 'react';
import { render } from 'test/util';
import { BaseLayout } from './BaseLayout';
import { imageFile, tenant } from 'test/fixtures';
import { TenantModel } from 'model';

const tenantMock: TenantModel = {
  ...tenant,
  configuration: {
    ...tenant.configuration,
    backgroundImageFile: imageFile,
    logoImageFile: imageFile,
  },
};

describe('TenantLayout', () => {
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
      /background-image: url\(https:\/\/example.com\/storage\/f\/123\?width=1250&fn=cover&format=webp\)/
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
});
