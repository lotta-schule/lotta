import { ApolloLink, Observable } from '@apollo/client';

const { startSpanMock, mockSpan } = vi.hoisted(() => {
  const mockSpan = {
    setStatus: vi.fn(),
    setAttribute: vi.fn(),
    end: vi.fn(),
  };
  return { startSpanMock: vi.fn(() => mockSpan), mockSpan };
});

vi.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: vi.fn(() => ({ startSpan: startSpanMock })),
    setSpan: vi.fn((ctx) => ctx),
  },
  context: {
    active: vi.fn(() => ({})),
    with: vi.fn((_ctx: unknown, fn: () => void) => fn()),
  },
  propagation: {
    inject: vi.fn(),
  },
  SpanKind: { CLIENT: 'CLIENT' },
  SpanStatusCode: { ERROR: 'ERROR', OK: 'OK' },
}));

import { createOtelLink } from './otelLink';

describe('createOtelLink', () => {
  let operation: ApolloLink.Operation;
  let forward: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    startSpanMock.mockClear();
    mockSpan.setAttribute.mockClear();

    operation = {
      operationName: 'TestOperation',
      query: {
        loc: { source: { body: 'query TestOperation { field }' } },
      },
      setContext: vi.fn((fn) => fn({ headers: {} })),
    } as unknown as ApolloLink.Operation;

    forward = vi.fn(
      () =>
        new Observable<ApolloLink.Result>((observer) => {
          observer.next({ data: {} });
          observer.complete();
        })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('adds provided headers as span attributes', () => {
    const otelLink = createOtelLink({
      headers: {
        'x-lotta-tenant': 'acme',
        'user-agent': 'lotta-webapp - 1.0.0',
      },
    });

    otelLink
      .request(operation, forward)!
      .subscribe({ next: () => {}, complete: () => {} });

    expect(startSpanMock).toHaveBeenCalledTimes(1);
    const [, options] = startSpanMock.mock.calls[0];
    expect(options.attributes).toMatchObject({
      'http.request.header.x-lotta-tenant': 'acme',
      'http.request.header.user-agent': 'lotta-webapp - 1.0.0',
    });
  });

  it('skips header values that are null or undefined', () => {
    const otelLink = createOtelLink({
      headers: {
        'x-lotta-tenant': 'acme',
        'x-lotta-originary-host': null,
        'user-agent': undefined,
      },
    });

    otelLink
      .request(operation, forward)!
      .subscribe({ next: () => {}, complete: () => {} });

    const [, options] = startSpanMock.mock.calls[0];
    expect(options.attributes).not.toHaveProperty(
      'http.request.header.x-lotta-originary-host'
    );
    expect(options.attributes).not.toHaveProperty(
      'http.request.header.user-agent'
    );
  });

  it('works without any headers provided', () => {
    const otelLink = createOtelLink();

    otelLink
      .request(operation, forward)!
      .subscribe({ next: () => {}, complete: () => {} });

    const [, options] = startSpanMock.mock.calls[0];
    const headerAttributeKeys = Object.keys(options.attributes).filter((key) =>
      key.startsWith('http.request.header.')
    );
    expect(headerAttributeKeys).toHaveLength(0);
  });
});
