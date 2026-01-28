import * as React from 'react';
import { render, userEvent } from 'test/util';
import { ErrorBoundary } from './ErrorBoundary';
import * as browserLocation from 'util/browserLocation';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Success</div>;
};

describe('profile/deleteUserProfilePage/components/ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when no error occurs', () => {
    const screen = render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child content')).toBeVisible();
  });

  it('should catch errors and show error UI', () => {
    const screen = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Success')).toBeNull();
    expect(screen.getByRole('button', { name: /neu laden/i })).toBeVisible();
  });

  it('should call reload when reload button clicked', async () => {
    const user = userEvent.setup();
    const screen = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /neu laden/i });
    await user.click(reloadButton);

    expect(browserLocation.reload).toHaveBeenCalledOnce();
  });

  it('should log error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });
});
