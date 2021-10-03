import { createProxyMiddleware } from 'http-proxy-middleware';

export default createProxyMiddleware({
    target: process.env.AUTH_URL,
    changeOrigin: true,
    xfwd: true,
});

export const config = {
    api: {
        bodyParser: false, // enable POST requests
        externalResolver: true, // hide warning message
    },
};
