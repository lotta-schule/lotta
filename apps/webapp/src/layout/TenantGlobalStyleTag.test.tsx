import { render } from '@testing-library/react';
import { TenantGlobalStyleTag } from './TenantGlobalStyleTag';
import { Tenant } from 'util/tenant';
import { imageFile, tenant } from 'test/fixtures';

describe('TenantGlobalStyleTag', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders null when there is no background image', async () => {
    const mockTenant = {
      configuration: {},
      backgroundImageFile: null,
    } as Tenant;

    const screen = render(<TenantGlobalStyleTag tenant={mockTenant} />);

    expect(screen.container).toBeEmptyDOMElement();
  });

  it('renders correct style tag when there is a background image', async () => {
    const mockTenant = {
      ...tenant,
      backgroundImageFile: imageFile,
    } as Tenant;

    const screen = render(<TenantGlobalStyleTag tenant={mockTenant} />);

    // Snapshot the rendered output
    expect(screen.container.querySelector('style')?.innerHTML)
      .toMatchInlineSnapshot(`
        "@media screen and (min-width: 600px) {
              body::after {
                background-image: image-set(url(https://example.com/123/pagebg_1024.webp) 1x,url(https://example.com/123/pagebg_1920.webp) 2x);
              }
          }
          @media screen and (min-width: 1280px) {
              body::after {
                background-image: image-set(url(https://example.com/123/pagebg_1280.webp) 1x,url(https://example.com/123/pagebg_2560.webp) 2x);
              }
          }"
      `);
  });
});
