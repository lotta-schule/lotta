import { appConfig } from 'config';
import { createProxyMiddleware } from 'http-proxy-middleware';

const proxy = createProxyMiddleware({
  target: appConfig.get('API_URL'),
  changeOrigin: true,
  pathRewrite: { '^/api/storage': '/storage' },
  xfwd: true,
  logLevel: 'debug',
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return proxy(req as any, {} as any);
}

export async function POST(req: Request) {
  return proxy(req as any, {} as any);
}

export async function PUT(req: Request) {
  return proxy(req as any, {} as any);
}

export async function DELETE(req: Request) {
  return proxy(req as any, {} as any);
}

export async function PATCH(req: Request) {
  return proxy(req as any, {} as any);
}
