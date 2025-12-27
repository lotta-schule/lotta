import { appConfig } from 'config';
import { createProxyMiddleware } from 'http-proxy-middleware';

export default createProxyMiddleware({
  target: appConfig.get('API_URL'),
  changeOrigin: true,
  autoRewrite: true,
  xfwd: true,
});

export const config = {
  api: {
    bodyParser: false, // enable POST requests
    externalResolver: true, // hide warning message
  },
};
