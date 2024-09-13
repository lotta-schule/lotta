import { render } from '@testing-library/react';
import { TenantGlobalStyleTag } from './TenantGlobalStyleTag';
import { TenantModel } from 'model';
import { getBaseUrl } from 'helper';
import { File } from 'util/model';

import { Mock, vi } from 'vitest';

// Mock the getBaseUrl function
vi.mock('helper', () => ({
  getBaseUrl: vi.fn(),
}));

// Mock the File model's getFileRemoteLocation function
vi.mock('util/model', () => ({
  File: {
    getFileRemoteLocation: vi.fn(),
  },
}));

describe('TenantGlobalStyleTag', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders null when there is no background image', async () => {
    const tenant: TenantModel = {
      configuration: {},
      backgroundImageFile: null,
    } as TenantModel;

    (getBaseUrl as Mock).mockResolvedValue('https://example.com');

    const { container } = render(await TenantGlobalStyleTag({ tenant }));

    expect(container).toBeEmptyDOMElement();
  });

  it('renders correct style tag when there is a background image', async () => {
    const tenant: TenantModel = {
      configuration: {},
      backgroundImageFile: { id: 'bg-image-id' },
    } as TenantModel;

    (getBaseUrl as Mock).mockResolvedValue('https://example.com');
    (File.getFileRemoteLocation as Mock).mockReturnValue(
      'https://example.com/bg-image-id'
    );

    const { container } = render(await TenantGlobalStyleTag({ tenant }));

    // Snapshot the rendered output
    expect(container.firstChild).toMatchInlineSnapshot(`
      <style>
        
      @media screen and (min-width: 600px) {
        body::after {
          background-image: url(https://example.com/bg-image-id?format=webp&fn=cover&width=1250);
          background-image:
            image-set(
              url(https://example.com/bg-image-id?format=webp&fn=cover&width=1250) 1x,
              url(https://example.com/bg-image-id?format=webp&fn=cover&width=2500) 2x
            );
        }
      }

      </style>
    `);
  });
});
