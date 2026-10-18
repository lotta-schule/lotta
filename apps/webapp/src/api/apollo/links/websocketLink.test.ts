import { Mock, MockedFunction } from 'vitest';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { createWebsocketLink } from './websocketLink';
import { isBrowser } from '#/util/isBrowser';
import { TenantModel } from '#/model';

vi.mock('@apollo/client/link/subscriptions');
vi.mock('graphql-ws');
vi.mock('#/util/isBrowser');

const isBrowserMock = isBrowser as MockedFunction<typeof isBrowser>;

describe('createWebsocketLink', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    isBrowserMock.mockReturnValue(true);
  });

  it('should create a websocket link with token', () => {
    const tenant: TenantModel = { id: 'test-tenant-id' } as TenantModel;
    const mockClient = {};
    (createClient as Mock).mockReturnValue(mockClient);

    const result = createWebsocketLink(
      tenant,
      'ws://localhost:4000/socket',
      'test-token'
    );

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'ws://localhost:4000/socket',
        connectionParams: expect.any(Function),
      })
    );

    const { connectionParams } = (createClient as Mock).mock.calls[0][0];
    expect(connectionParams()).toEqual({
      token: 'test-token',
      tid: 'test-tenant-id',
    });

    expect(GraphQLWsLink).toHaveBeenCalledWith(mockClient);
    expect(result).toBeInstanceOf(GraphQLWsLink);
  });

  it('should create a websocket link without token', () => {
    const tenant: TenantModel = { id: 'test-tenant-id' } as TenantModel;
    const mockClient = {};
    (createClient as Mock).mockReturnValue(mockClient);

    const result = createWebsocketLink(tenant, 'ws://localhost:4000/socket');

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'ws://localhost:4000/socket',
        connectionParams: expect.any(Function),
      })
    );

    const { connectionParams } = (createClient as Mock).mock.calls[0][0];
    expect(connectionParams()).toEqual({ tid: 'test-tenant-id' });

    expect(GraphQLWsLink).toHaveBeenCalledWith(mockClient);
    expect(result).toBeInstanceOf(GraphQLWsLink);
  });

  it('should return null if not in browser', () => {
    const tenant: TenantModel = { id: 'test-tenant-id' } as TenantModel;
    (isBrowser as Mock).mockReturnValue(false);

    const result = createWebsocketLink(tenant, 'ws://localhost:4000/socket');

    expect(createClient).not.toHaveBeenCalled();
    expect(GraphQLWsLink).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null if no socket URL is provided', () => {
    const tenant: TenantModel = { id: 'test-tenant-id' } as TenantModel;

    const result = createWebsocketLink(tenant, null);

    expect(createClient).not.toHaveBeenCalled();
    expect(GraphQLWsLink).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
