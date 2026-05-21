import { appConfig } from 'config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { NextApiHandler } from 'next';

export default createProxyMiddleware({
  target: appConfig.get('API_URL'),
  changeOrigin: true,
  pathRewrite: { '^/api/setup': '/setup' },
  xfwd: true,
}) as unknown as NextApiHandler;

export const config = {
  api: {
    bodyParser: false, // enable POST requests
    externalResolver: true, // hide warning message
  },
};
