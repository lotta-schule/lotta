const { createServer } = require('node:http');
const { parse } = require('node:url');
const { Console } = require('node:console');

const console = new Console({ stdout: process.stdout, stderr: process.stderr });
const port = process.env.PORT || 3000;

const originalFetch = globalThis.fetch;

globalThis.fetch = async (url, options) => {
  console.trace('fetch');
  console.log({ url, ...options });
  return originalFetch(url, options).then((res) => {
    console.log('fetch result: ');
    console.log({ res });
    return res;
  });
};

const startServer = async () => {
  require('./tracing.cjs');
  const next = require('next');

  const app = next({ dev: process.env.NODE_ENV !== 'production' });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Lotta listening on http://localhost:${port}`);
  });
};

startServer();
