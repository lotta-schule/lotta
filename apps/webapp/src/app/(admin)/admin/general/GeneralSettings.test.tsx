import { render, waitFor } from 'test/util';
import { GeneralSettings } from './GeneralSettings';
import { useRouter } from 'next/navigation';
import { Mock, vi } from 'vitest';
import { SelectFileOverlayProps } from 'shared/edit/SelectFileOverlay';
import { imageFile, tenant } from 'test/fixtures';
import { ResponsiveImageProps } from 'util/image/ResponsiveImage';
import { MockLink } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('shared/edit/SelectFileOverlay', () => ({
  SelectFileOverlay: ({
    children,
    onSelectFile,
    label,
    allowDeletion: _allowDeletion,
  }: SelectFileOverlayProps) => (
    <div
      data-testid="select-file-overlay"
      onClick={() => onSelectFile(imageFile)}
    >
      {children}
      {label}
    </div>
  ),
}));

vi.mock('util/image/ResponsiveImage', () => ({
  ResponsiveImage: ({ src, alt }: ResponsiveImageProps) => (
    <img src={src} alt={alt} data-testid="responsive-image" />
  ),
}));

describe('GeneralSettings', () => {
  const additionalMocks: MockLink.MockedResponse[] = [
    {
      request: {
        query: UpdateTenantMutation,
        variables: (_var) => true,
      },
      result: { data: { tenant: { ...tenant, title: 'A new Name' } } },
    },
  ];

  const mockRouter = {
    refresh: vi.fn(),
  };

  beforeEach(() => {
    (useRouter as Mock).mockReturnValue(mockRouter);

    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();

    vi.useRealTimers();
  });

  it('renders tenant details correctly', () => {
    const screen = render(
      <GeneralSettings tenant={tenant} />,
      {},
      { additionalMocks }
    );

    expect(screen.getByLabelText('Name der Seite')).toHaveValue(
      'DerEineVonHier'
    );
    expect(screen.getByText('info.lotta.schule')).toBeInTheDocument();
  });

  it('calls updateTenant mutation and refreshes the page on save', async () => {
    const user = userEvent.setup();
    const screen = render(
      <GeneralSettings tenant={tenant} />,
      {},
      { additionalMocks, tenant }
    );

    const saveButton = screen.getByText('speichern');
    await user.click(saveButton);

    vi.advanceTimersByTime(2000);

    await waitFor(
      () => {
        expect(mockRouter.refresh).toHaveBeenCalled();
      },
      { timeout: 4000 }
    );
  });
});
