import * as AbsintheSocket from '@absinthe/socket';
import { Mock, MockedFunction } from 'vitest';
import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';
import { Socket as PhoenixSocket } from 'phoenix';
import { createWebsocketLink } from './websocketLink';
import { isBrowser } from 'util/isBrowser';
import { TenantModel } from 'model';

vi.mock('@absinthe/socket');
vi.mock('@absinthe/socket-apollo-link');
vi.mock('phoenix');
vi.mock('util/isBrowser');

const isBrowserMock = isBrowser as MockedFunction<typeof isBrowser>;

describe('createWebsocketLink', () => {
  // const originalWindowLocation = window.location;

  beforeEach(() => {
    vi.resetAllMocks();
    isBrowserMock.mockReturnValue(true);
    localStorage.setItem('id', 'test-token');
    // todo: find a better way to mock window.location
    // delete (window as any).location;
    // (window as any).location = {
    //   protocol: 'http:',
    //   href: 'http://localhost',
    // };
  });

  afterEach(() => {
    localStorage.clear();
    // (window as any).location = originalWindowLocation;
  });

  it('should create a websocket link with token', () => {
    const tenant: TenantModel = { id: 'test-tenant-id' } as TenantModel;
    const mockAbsintheSocket = {};
    (AbsintheSocket.create as Mock).mockReturnValue(mockAbsintheSocket);
    (createAbsintheSocketLink as Mock).mockReturnValue('mock-link');

    const result = createWebsocketLink(
      tenant,
      'ws://localhost:4000/socket',
      'test-token'
    );

    expect(PhoenixSocket).toHaveBeenCalledWith('ws://localhost:4000/socket', {
      params: expect.any(Function),
    });

    const paramsFunction = (PhoenixSocket as Mock).mock.calls[0][1].params;
    expect(paramsFunction()).toEqual({
      token: 'test-token',
      tid: 'test-tenant-id',
    });

    expect(AbsintheSocket.create).toHaveBeenCalledWith(
      expect.any(PhoenixSocket)
    );
    expect(createAbsintheSocketLink).toHaveBeenCalledWith(mockAbsintheSocket);
    expect(result).toBe('mock-link');
  });

  it('should create a websocket link without token', () => {
    const tenant: TenantModel = { id: 'test-tenant-id' } as TenantModel;
    const mockAbsintheSocket = {};
    (AbsintheSocket.create as Mock).mockReturnValue(mockAbsintheSocket);
    (createAbsintheSocketLink as Mock).mockReturnValue('mock-link');

    localStorage.removeItem('id');
    const result = createWebsocketLink(tenant, 'ws://localhost:4000/socket');

    expect(PhoenixSocket).toHaveBeenCalledWith('ws://localhost:4000/socket', {
      params: expect.any(Function),
    });

    const paramsFunction = (PhoenixSocket as Mock).mock.calls[0][1].params;
    expect(paramsFunction()).toEqual({ tid: 'test-tenant-id' });

    expect(AbsintheSocket.create).toHaveBeenCalledWith(
      expect.any(PhoenixSocket)
    );
    expect(createAbsintheSocketLink).toHaveBeenCalledWith(mockAbsintheSocket);
    expect(result).toBe('mock-link');
  });

  it('should return null if not in browser', () => {
    const tenant: TenantModel = { id: 'test-tenant-id' } as TenantModel;
    (isBrowser as Mock).mockReturnValue(false);

    const result = createWebsocketLink(tenant, 'ws://localhost:4000/socket');

    expect(PhoenixSocket).not.toHaveBeenCalled();
    expect(AbsintheSocket.create).not.toHaveBeenCalled();
    expect(createAbsintheSocketLink).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null if no socket URL is provided', () => {
    const tenant: TenantModel = { id: 'test-tenant-id' } as TenantModel;

    const result = createWebsocketLink(tenant, null);

    expect(PhoenixSocket).not.toHaveBeenCalled();
    expect(AbsintheSocket.create).not.toHaveBeenCalled();
    expect(createAbsintheSocketLink).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
