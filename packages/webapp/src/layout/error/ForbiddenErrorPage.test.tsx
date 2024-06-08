import { render, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ForbiddenErrorPage } from './ForbiddenErrorPage';
import { MockedFunction } from 'vitest';

describe('ForbiddenErrorPage', () => {
  const mockRouter = {
    replace: vi.fn(),
    prefetch: vi.fn(),
  };
  beforeEach(() => {
    (useRouter as MockedFunction<typeof useRouter>).mockReturnValue(
      mockRouter as any
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should render the ForbiddenErrorPage component', () => {
    const screen = render(<ForbiddenErrorPage />);
    expect(screen.container).toMatchSnapshot();
  });

  it('should redirect to the home page after 5 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const screen = render(<ForbiddenErrorPage />);

    expect(screen.container).toBeVisible();

    expect(mockRouter.prefetch).toHaveBeenCalledWith('/');

    vi.runAllTimers();

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
  });
});
