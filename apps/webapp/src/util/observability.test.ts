import { trace } from '@opentelemetry/api';
import {
  getTraceContext,
  isExpectedGraphQLError,
  isIgnoredIncomingRequest,
  setTenantSpanAttributes,
  setUserSpanAttributes,
} from './observability';

describe('observability', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isExpectedGraphQLError', () => {
    it('accepts known error codes', () => {
      expect(
        isExpectedGraphQLError({
          message: 'x',
          path: ['a'],
          extensions: { code: 'FORBIDDEN' },
        })
      ).toBe(true);
    });

    it('rejects unknown error codes', () => {
      expect(
        isExpectedGraphQLError({
          message: 'nicht gefunden',
          path: ['a'],
          extensions: { code: 'INTERNAL' },
        })
      ).toBe(false);
    });

    it('recognizes not found / permission messages', () => {
      expect(
        isExpectedGraphQLError({
          message: 'Ordner mit der id 5 nicht gefunden.',
          path: ['directory'],
        })
      ).toBe(true);
      expect(
        isExpectedGraphQLError({
          message: 'Du darfst diesen Beitrag nicht bearbeiten.',
          path: ['updateArticle'],
        })
      ).toBe(true);
    });

    it('treats unknown messages and schema errors as unexpected', () => {
      expect(
        isExpectedGraphQLError({ message: 'Unknown error', path: ['a'] })
      ).toBe(false);
      expect(isExpectedGraphQLError({ message: 'Field "foo" not found' })).toBe(
        false
      );
    });
  });

  describe('isIgnoredIncomingRequest', () => {
    it('ignores static assets and health checks', () => {
      expect(isIgnoredIncomingRequest('/_next/static/chunks/main.js')).toBe(
        true
      );
      expect(isIgnoredIncomingRequest('/dbg/health')).toBe(true);
      expect(isIgnoredIncomingRequest('/favicon.ico?v=2')).toBe(true);
    });

    it('keeps pages and API requests', () => {
      expect(isIgnoredIncomingRequest('/')).toBe(false);
      expect(isIgnoredIncomingRequest('/a/123-article')).toBe(false);
      expect(isIgnoredIncomingRequest('/api')).toBe(false);
      expect(isIgnoredIncomingRequest(undefined)).toBe(false);
    });
  });

  describe('span attributes', () => {
    const span = { setAttributes: vi.fn() };

    beforeEach(() => {
      span.setAttributes.mockClear();
      vi.spyOn(trace, 'getActiveSpan').mockReturnValue(span as any);
    });

    it('sets numeric tenant and user IDs', () => {
      setTenantSpanAttributes({ id: '42', slug: 'school' });
      setUserSpanAttributes({ id: '7' });

      expect(span.setAttributes).toHaveBeenCalledWith({
        'tenant.id': 42,
        'tenant.slug': 'school',
      });
      expect(span.setAttributes).toHaveBeenCalledWith({
        'enduser.id': 7,
        'user.id': 7,
      });
    });

    it('ignores missing tenant or user', () => {
      setTenantSpanAttributes(null);
      setUserSpanAttributes(undefined);
      expect(span.setAttributes).not.toHaveBeenCalled();
    });
  });

  describe('getTraceContext', () => {
    it('returns nothing without an active span', () => {
      vi.spyOn(trace, 'getActiveSpan').mockReturnValue(undefined);
      expect(getTraceContext()).toEqual({});
    });

    it('returns the active span ids', () => {
      vi.spyOn(trace, 'getActiveSpan').mockReturnValue({
        spanContext: () => ({
          traceId: '0af7651916cd43dd8448eb211c80319c',
          spanId: 'b7ad6b7169203331',
          traceFlags: 1,
        }),
      } as any);
      expect(getTraceContext()).toEqual({
        trace_id: '0af7651916cd43dd8448eb211c80319c',
        span_id: 'b7ad6b7169203331',
      });
    });
  });
});
