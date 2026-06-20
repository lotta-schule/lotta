import { Mock } from 'vitest';
import { ApolloClient, ApolloLink } from '@apollo/client';
import { createRSCClient } from './client-rsc';
import { createOtelLink } from './links/otelLink';
import { createHttpLink } from './links/httpLink';
import { createAuthLink } from './links/authLink';
import { createErrorLink } from './links/errorLink';
import { createVariableInputMutationsLink } from './links/variableInputMutationsLink';

const { headerValuesMap } = vi.hoisted(() => ({
  headerValuesMap: {} as Record<string, string | undefined>,
}));

vi.mock('next/headers.js', () => ({
  headers: () =>
    Promise.resolve({
      get: vi.fn((key: string) => headerValuesMap[key] ?? null),
    }),
  cookies: () =>
    Promise.resolve({
      get: vi.fn().mockReturnValue(undefined),
    }),
}));

vi.mock('./links/otelLink');
vi.mock('./links/httpLink');
vi.mock('./links/authLink');
vi.mock('./links/errorLink');
vi.mock('./links/variableInputMutationsLink');

const passthroughLink = () =>
  new ApolloLink((operation, forward) => forward(operation));

const mockCreateOtelLink = createOtelLink as Mock;
const mockCreateHttpLink = createHttpLink as Mock;
const mockCreateAuthLink = createAuthLink as Mock;
const mockCreateErrorLink = createErrorLink as Mock;
const mockCreateVariableInputMutationsLink =
  createVariableInputMutationsLink as Mock;

describe('Apollo RSC Client', () => {
  beforeEach(() => {
    Object.keys(headerValuesMap).forEach((key) => delete headerValuesMap[key]);

    mockCreateOtelLink.mockReturnValue(passthroughLink());
    mockCreateHttpLink.mockReturnValue(passthroughLink());
    mockCreateAuthLink.mockReturnValue(passthroughLink());
    mockCreateErrorLink.mockReturnValue(passthroughLink());
    mockCreateVariableInputMutationsLink.mockReturnValue(passthroughLink());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create an ApolloClient', async () => {
    const client = await createRSCClient();

    expect(client).toBeInstanceOf(ApolloClient);
  });

  it('forwards the x-lotta-tenant header to both the otel link and the http link', async () => {
    headerValuesMap['x-lotta-tenant'] = 'acme';

    await createRSCClient();

    expect(mockCreateOtelLink).toHaveBeenCalledWith({
      headers: expect.objectContaining({ 'x-lotta-tenant': 'acme' }),
    });

    const { requestExtraHeaders } = mockCreateHttpLink.mock.calls[0][0];
    expect(requestExtraHeaders()).toMatchObject({
      'x-lotta-tenant': 'acme',
    });
  });

  it('falls back from x-lotta-originary-host to x-forwarded-host to host', async () => {
    headerValuesMap['host'] = 'fallback.example.com';
    await createRSCClient();
    expect(
      mockCreateHttpLink.mock.calls[0][0].requestExtraHeaders()
    ).toMatchObject({ 'x-lotta-originary-host': 'fallback.example.com' });

    headerValuesMap['x-forwarded-host'] = 'forwarded.example.com';
    await createRSCClient();
    expect(
      mockCreateHttpLink.mock.calls[1][0].requestExtraHeaders()
    ).toMatchObject({ 'x-lotta-originary-host': 'forwarded.example.com' });

    headerValuesMap['x-lotta-originary-host'] = 'direct.example.com';
    await createRSCClient();
    expect(
      mockCreateHttpLink.mock.calls[2][0].requestExtraHeaders()
    ).toMatchObject({ 'x-lotta-originary-host': 'direct.example.com' });
  });

  it('uses the request user-agent for the otel span but the package name/version for the outgoing request', async () => {
    headerValuesMap['user-agent'] = 'Mozilla/5.0 test-agent';

    await createRSCClient();

    expect(mockCreateOtelLink).toHaveBeenCalledWith({
      headers: expect.objectContaining({
        'user-agent': 'Mozilla/5.0 test-agent',
      }),
    });

    const { requestExtraHeaders } = mockCreateHttpLink.mock.calls[0][0];
    expect(requestExtraHeaders()['user-agent']).not.toBe(
      'Mozilla/5.0 test-agent'
    );
  });
});
