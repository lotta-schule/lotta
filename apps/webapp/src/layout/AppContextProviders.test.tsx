import * as React from 'react';
import { render, waitFor } from 'test/util';
import { AppContextProviders } from './AppContextProviders';
import { tenant, allCategories, KeinErSieEsUser } from 'test/fixtures';
import { vi } from 'vitest';
import * as legacyClientModule from 'api/legacyClient';

vi.mock('api/legacyClient');

vi.mock('shared/Authentication', () => ({
  default: () => <div data-testid="authentication">Authentication</div>,
}));

vi.mock('./AppHead', () => ({
  AppHead: () => <div data-testid="app-head">AppHead</div>,
}));

vi.mock('./BaseLayout', () => ({
  BaseLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="base-layout">{children}</div>
  ),
}));

describe('AppContextProviders', () => {
  const defaultProps = {
    tenant,
    categories: allCategories,
    currentUser: KeinErSieEsUser,
    requestBaseUrl: 'http://localhost:3000',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = '';
    vi.mocked(legacyClientModule.getApolloClient).mockReturnValue({
      writeQuery: vi.fn(),
    } as any);
  });

  it('should render children with all context providers', () => {
    const screen = render(
      <AppContextProviders {...defaultProps}>
        <div>Test Child</div>
      </AppContextProviders>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
    expect(screen.getByTestId('base-layout')).toBeInTheDocument();
    expect(screen.getByTestId('app-head')).toBeInTheDocument();
  });

  it('should create Apollo client with tenant and socketUrl', () => {
    render(
      <AppContextProviders {...defaultProps} socketUrl="ws://localhost:4000">
        <div>Test</div>
      </AppContextProviders>
    );

    expect(legacyClientModule.getApolloClient).toHaveBeenCalledWith({
      tenant,
      socketUrl: 'ws://localhost:4000',
    });
  });

  it('should create Apollo client without socketUrl when not provided', () => {
    render(
      <AppContextProviders {...defaultProps}>
        <div>Test</div>
      </AppContextProviders>
    );

    expect(legacyClientModule.getApolloClient).toHaveBeenCalledWith({
      tenant,
      socketUrl: undefined,
    });
  });

  it('should show password change dialog when request_pw_reset cookie is set', async () => {
    document.cookie = 'request_pw_reset=1; path=/';

    const screen = render(
      <AppContextProviders {...defaultProps}>
        <div>Test</div>
      </AppContextProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId('UpdatePasswordDialog')).toBeInTheDocument();
    });
  });

  it('should apply custom theme from tenant configuration', () => {
    const customTenant = {
      ...tenant,
      configuration: {
        ...tenant.configuration,
        customTheme: {
          primaryColor: '#ff0000',
        },
      },
    };

    const screen = render(
      <AppContextProviders {...defaultProps} tenant={customTenant}>
        <div>Test</div>
      </AppContextProviders>
    );

    const styleElements = screen.container.querySelectorAll('style');
    expect(styleElements.length).toBeGreaterThan(0);
  });
});
