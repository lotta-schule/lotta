import * as AbsintheSocket from '@absinthe/socket';
import { Mock, MockedClass, MockedFunction } from 'vitest';
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
const PhoenixSocketMock = PhoenixSocket as MockedClass<typeof PhoenixSocket>;

describe('createWebsocketLink', () => {
  const originalWindowLocation = window.location;

  beforeEach(() => {
    vi.resetAllMocks();
    isBrowserMock.mockReturnValue(true);
    global.localStorage.setItem('id', 'test-token');
    delete (window as any).location;
    (window as any).location = {
      protocol: 'http:',
      href: 'http://localhost',
    };
  });

  afterEach(() => {
    global.localStorage.clear();
    (window as any).location = originalWindowLocation;
  });

  it('should create a websocket link with token', () => {
    const tenant: TenantModel = { id: 'test-tenant-id' } as TenantModel;
    const mockPhoenixSocket = { params: vi.fn() };
    const mockAbsintheSocket = {};
    PhoenixSocketMock.mockImplementation(() => mockPhoenixSocket as any);
    (AbsintheSocket.create as Mock).mockReturnValue(mockAbsintheSocket);
    (createAbsintheSocketLink as Mock).mockReturnValue('mock-link');

    const result = createWebsocketLink(tenant, 'ws://localhost:4000/socket');

    expect(PhoenixSocket).toHaveBeenCalledWith('ws://localhost:4000/socket', {
      params: expect.any(Function),
    });

    const paramsFunction = (PhoenixSocket as Mock).mock.calls[0][1].params;
    expect(paramsFunction()).toEqual({
      token: 'test-token',
      tid: 'test-tenant-id',
    });

    expect(AbsintheSocket.create).toHaveBeenCalledWith(mockPhoenixSocket);
    expect(createAbsintheSocketLink).toHaveBeenCalledWith(mockAbsintheSocket);
    expect(result).toBe('mock-link');
  });

  it('should create a websocket link without token', () => {
    const tenant: TenantModel = { id: 'test-tenant-id' } as TenantModel;
    const mockPhoenixSocket = { params: vi.fn() };
    const mockAbsintheSocket = {};
    (PhoenixSocket as Mock).mockImplementation(() => mockPhoenixSocket);
    (AbsintheSocket.create as Mock).mockReturnValue(mockAbsintheSocket);
    (createAbsintheSocketLink as Mock).mockReturnValue('mock-link');

    global.localStorage.removeItem('id');
    const result = createWebsocketLink(tenant, 'ws://localhost:4000/socket');

    expect(PhoenixSocket).toHaveBeenCalledWith('ws://localhost:4000/socket', {
      params: expect.any(Function),
    });

    const paramsFunction = (PhoenixSocket as Mock).mock.calls[0][1].params;
    expect(paramsFunction()).toEqual({ tid: 'test-tenant-id' });

    expect(AbsintheSocket.create).toHaveBeenCalledWith(mockPhoenixSocket);
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
