import { loadTenant, TenantNotFoundError } from './loadTenant';
import { getClient } from 'api/client';
import { vi } from 'vitest';

vi.mock('api/client');
vi.mock('@apollo/client-integration-nextjs', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  registerApolloClient: vi.fn(),
}));
vi.mock('api/apollo/client-rsc', () => ({
  createRSCClient: vi.fn(),
}));

const mockGetClient = vi.mocked(getClient);

describe('loadTenant', () => {
  const createMockClient = (queryResults: Record<string, any>) => {
    return {
      query: vi.fn().mockImplementation(({ query }) => {
        const queryName = query.definitions[0]?.name?.value;
        return Promise.resolve(queryResults[queryName] || { data: null });
      }),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load tenant successfully without stats', async () => {
    const mockTenant = {
      id: '1',
      title: 'Test School',
      slug: 'test-school',
      host: 'test.lotta.schule',
    };

    const client = createMockClient({
      GetTenant: { data: { tenant: mockTenant } },
    });
    mockGetClient.mockResolvedValue(client as any);

    const result = await loadTenant();

    expect(result).toEqual(mockTenant);
  });

  it('should load tenant successfully with stats', async () => {
    const mockTenant = {
      id: '1',
      title: 'Test School',
      slug: 'test-school',
      host: 'test.lotta.schule',
      stats: {
        userCount: 150,
        articleCount: 250,
      },
    };

    const client = createMockClient({
      GetTenantWithStats: { data: { tenant: mockTenant } },
    });
    mockGetClient.mockResolvedValue(client as any);

    const result = await loadTenant({ includeStats: true });

    expect(result).toEqual(mockTenant);
  });

  it('should throw TenantNotFoundError when tenant is null', async () => {
    const client = createMockClient({
      GetTenant: { data: { tenant: null } },
    });
    mockGetClient.mockResolvedValue(client as any);

    await expect(loadTenant()).rejects.toThrow(TenantNotFoundError);
  });

  it('should throw TenantNotFoundError when data is null', async () => {
    const client = createMockClient({
      GetTenant: { data: null },
    });
    mockGetClient.mockResolvedValue(client as any);

    await expect(loadTenant()).rejects.toThrow(TenantNotFoundError);
  });

  it('should use correct query based on includeStats parameter', async () => {
    const baseTenant = {
      id: '1',
      title: 'Test School',
      slug: 'test-school',
      host: 'test.lotta.schule',
    };

    // Test without stats
    const clientWithoutStats = createMockClient({
      GetTenant: { data: { tenant: baseTenant } },
    });
    mockGetClient.mockResolvedValue(clientWithoutStats as any);

    await loadTenant({ includeStats: false });

    // Test with stats
    const clientWithStats = createMockClient({
      GetTenantWithStats: {
        data: {
          tenant: {
            ...baseTenant,
            stats: { userCount: 100, articleCount: 200 },
          },
        },
      },
    });
    mockGetClient.mockResolvedValue(clientWithStats as any);

    const resultWithStats = await loadTenant({ includeStats: true });
    expect(resultWithStats.stats).toBeDefined();
  });

  it('should handle query errors', async () => {
    const client = {
      query: vi.fn().mockRejectedValue(new Error('GraphQL error')),
    };
    mockGetClient.mockResolvedValue(client as any);

    await expect(loadTenant()).rejects.toThrow('GraphQL error');
  });

  it('should handle client initialization errors', async () => {
    const error = new Error('Client error');
    mockGetClient.mockRejectedValue(error);

    await expect(loadTenant()).rejects.toThrow('Client error');
  });

  describe('TenantNotFoundError', () => {
    it('should have correct name and message', () => {
      const error = new TenantNotFoundError();
      expect(error.name).toBe('TenantNotFoundError');
      expect(error.message).toBe('Tenant not found');
    });
  });
});
