import { describe, it, expect, vi } from 'vitest';

vi.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: vi.fn(() => vi.fn()),
}));

vi.mock('config', () => ({
  appConfig: {
    get: vi.fn((key: string) => {
      if (key === 'API_URL') return 'http://localhost:4000';
      return undefined;
    }),
  },
}));

describe('/api/auth/callback', () => {
  it('should create proxy middleware with correct configuration', async () => {
    const { createProxyMiddleware } = await import('http-proxy-middleware');

    await import('./[...path]');

    expect(createProxyMiddleware).toHaveBeenCalledWith({
      target: 'http://localhost:4000',
      changeOrigin: true,
      pathRewrite: { '^/api/auth': '/auth' },
      xfwd: true,
    });
  });

  it('should export correct Next.js API config', async () => {
    const callbackModule = await import('./[...path]');

    expect(callbackModule.config).toEqual({
      api: {
        bodyParser: false,
        externalResolver: true,
      },
    });
  });

  it('should use API_URL from app config', async () => {
    const { appConfig } = await import('config');

    await import('./[...path]');

    expect(appConfig.get).toHaveBeenCalledWith('API_URL');
  });
});
