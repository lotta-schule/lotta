import { Mock, MockedFunction } from 'vitest';
import { createLink } from 'apollo-v3-absinthe-upload-link';
import { createCustomFetch } from '../customFetch';
import { appConfig } from 'config';
import { isBrowser } from 'util/isBrowser';
import { createHttpLink } from './httpLink';

vi.mock('apollo-v3-absinthe-upload-link');
vi.mock('../customFetch');
vi.mock('util/isBrowser');

const appConfigGet = vi.spyOn(appConfig, 'get');

const mockCreateLink = createLink as Mock;
const mockCreateCustomFetch = createCustomFetch as Mock;
const mockIsBrowser = isBrowser as MockedFunction<typeof isBrowser>;

describe('createHttpLink', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a link with browser URI and custom fetch', () => {
    const requestExtraHeadersMock = vi.fn().mockReturnValue({});
    const customFetchMock = vi.fn();
    mockCreateCustomFetch.mockReturnValue(customFetchMock);
    appConfigGet.mockReturnValue('https://api.example.com');

    const result = createHttpLink({
      requestExtraHeaders: requestExtraHeadersMock,
    });

    expect(mockCreateCustomFetch).toHaveBeenCalledWith({
      requestExtraHeaders: requestExtraHeadersMock,
    });
    expect(mockCreateLink).toHaveBeenCalledWith({
      uri: '/api',
      fetch: customFetchMock,
    });
    expect(result).toBe(mockCreateLink.mock.results[0].value);
  });

  it('should create a link with server URI and custom fetch', () => {
    const requestExtraHeadersMock = vi.fn().mockReturnValue({});
    const customFetchMock = vi.fn();
    mockCreateCustomFetch.mockReturnValue(customFetchMock);
    appConfigGet.mockReturnValue('https://api.example.com');
    mockIsBrowser.mockImplementation(() => true);

    const result = createHttpLink({
      requestExtraHeaders: requestExtraHeadersMock,
    });

    const expectedUrl = '/api'.toString();

    expect(mockCreateCustomFetch).toHaveBeenCalledWith({
      requestExtraHeaders: requestExtraHeadersMock,
    });
    expect(mockCreateLink).toHaveBeenCalledWith({
      uri: expectedUrl,
      fetch: customFetchMock,
    });
    expect(result).toBe(mockCreateLink.mock.results[0].value);
  });

  it('should use default requestExtraHeaders if not provided', () => {
    const customFetchMock = vi.fn();
    mockCreateCustomFetch.mockReturnValue(customFetchMock);
    mockIsBrowser.mockImplementation(() => true);
    appConfigGet.mockReturnValue('https://api.example.com');

    const result = createHttpLink();

    expect(mockCreateCustomFetch).toHaveBeenCalledWith({
      requestExtraHeaders: expect.any(Function),
    });
    expect(mockCreateLink).toHaveBeenCalledWith({
      uri: '/api',
      fetch: customFetchMock,
    });
    expect(result).toBe(mockCreateLink.mock.results[0].value);
  });
});
